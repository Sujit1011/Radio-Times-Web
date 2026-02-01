import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStationsByCountry, fetchAvailableCountries, fetchTopStations } from '../utils/countryData';
import { getTimeZoneByCountryCode } from '../utils/timezoneData';

const RadioContext = createContext();

export const useRadio = () => {
    const context = useContext(RadioContext);
    if (!context) {
        throw new Error('useRadio must be used within a RadioProvider');
    }
    return context;
};

/**
 * RadioProvider Component
 * The central state management hub for the application.
 * Responsibilities:
 * - Persisting user favorites and recent station history to localStorage.
 * - Managing global playback state (current station, play/pause status).
 * - Orchestrating station fetching (by country or popularity).
 * - Handling the global sleep timer and broken icon tracking.
 * - Providing search and view filtering logic to child components.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that require access to radio state.
 * @returns {JSX.Element} The context provider wrapping its children.
 */
export const RadioProvider = ({ children }) => {
    // --- State ---
    const [allCountries, setAllCountries] = useState([]);
    const [isCountriesLoading, setIsCountriesLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [stations, setStations] = useState([]);
    const [currentStation, setCurrentStation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('radio_favorites') || '[]'));
    const [recentStations, setRecentStations] = useState(() => JSON.parse(localStorage.getItem('radio_recent') || '[]'));
    const [brokenIcons, setBrokenIcons] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('all'); // 'all', 'favorites', or 'recent'
    const [stationsLimit, setStationsLimit] = useState(40);
    const [selectionTime, setSelectionTime] = useState(null);
    const [selectedTimeZone, setSelectedTimeZone] = useState(null);

    // Sleep Timer State
    const [sleepTimer, setSleepTimer] = useState(null); // time in seconds

    // --- Effects ---

    // Persistence
    useEffect(() => {
        localStorage.setItem('radio_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('radio_recent', JSON.stringify(recentStations));
    }, [recentStations]);

    // Sleep Timer Logic
    useEffect(() => {
        if (sleepTimer === null || !isPlaying) return;

        const interval = setInterval(() => {
            setSleepTimer(prev => {
                if (prev === null) return null;
                if (prev <= 1) {
                    setIsPlaying(false);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, sleepTimer === null]); // Only restart if playback toggles or timer is enabled/disabled

    const markIconAsBroken = useCallback((url) => {
        setBrokenIcons(prev => new Set(prev).add(url));
    }, []);

    const isIconBroken = useCallback((url) => {
        return brokenIcons.has(url);
    }, [brokenIcons]);

    // Load stations when country changes
    useEffect(() => {
        const loadStations = async () => {
            setIsLoading(true);
            setStationsLimit(40); // Reset limit on country change

            let data;
            if (selectedCountry) {
                data = await fetchStationsByCountry(selectedCountry);
            } else {
                data = await fetchTopStations(100);
            }

            // Sort by votes/popularity if available
            const sortedData = data.sort((a, b) => (b.votes || 0) - (a.votes || 0));
            setStations(sortedData);
            setIsLoading(false);
        };

        loadStations();
    }, [selectedCountry]);

    // --- Actions ---

    const selectCountry = (code) => {
        const countryCode = code.toLowerCase();
        setSelectedCountry(countryCode);
        setSelectedTimeZone(getTimeZoneByCountryCode(countryCode));
        setSelectionTime(new Date());
        setView('all');
        setSearchQuery('');
        setStationsLimit(40);
    };

    const playStation = useCallback((station) => {
        if (currentStation?.stationuuid === station.stationuuid) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentStation(station);
            setIsPlaying(true);

            // Update Recent Stations
            setRecentStations(prev => {
                const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
                return [station, ...filtered].slice(0, 15);
            });
        }
    }, [currentStation, isPlaying]);

    const toggleFavorite = (station) => {
        setFavorites(prev => {
            const isFav = prev.some(f => f.stationuuid === station.stationuuid);
            if (isFav) {
                return prev.filter(f => f.stationuuid !== station.stationuuid);
            } else {
                return [...prev, station];
            }
        });
    };

    const isStationFavorite = useCallback((stationId) => {
        return favorites.some(f => f.stationuuid === stationId);
    }, [favorites]);

    // --- Derived State ---
    const filteredStations = useMemo(() => {
        if (!searchQuery) return stations;
        const query = searchQuery.toLowerCase();
        return stations.filter(station => {
            return (
                station.name.toLowerCase().includes(query) ||
                (station.tags && station.tags.toLowerCase().includes(query)) ||
                (station.state && station.state.toLowerCase().includes(query))
            );
        });
    }, [stations, searchQuery]);

    const displayedStations = useMemo(() => {
        return filteredStations.slice(0, stationsLimit);
    }, [filteredStations, stationsLimit]);

    const loadMore = () => {
        setStationsLimit(prev => prev + 40);
    };

    // Load all countries on mount (with caching)
    useEffect(() => {
        const loadCountries = async () => {
            const CACHE_KEY = 'radio-countries-cache';
            const CACHE_TIME_KEY = 'radio-countries-cache-time';
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            const now = Date.now();

            if (cachedData && cachedTime && (now - parseInt(cachedTime)) < TWENTY_FOUR_HOURS) {
                setAllCountries(JSON.parse(cachedData));
                return;
            }

            setIsCountriesLoading(true);
            const countries = await fetchAvailableCountries();
            if (countries && countries.length > 0) {
                setAllCountries(countries);
                localStorage.setItem(CACHE_KEY, JSON.stringify(countries));
                localStorage.setItem(CACHE_TIME_KEY, now.toString());
            }
            setIsCountriesLoading(false);
        };
        loadCountries();
    }, []);

    const value = {
        allCountries,
        isCountriesLoading,
        selectedCountry,
        stations: displayedStations,
        totalCount: filteredStations.length,
        hasMore: stationsLimit < filteredStations.length,
        loadMore,
        allStations: stations,
        currentStation,
        isPlaying,
        setIsPlaying,
        isLoading,
        favorites,
        recentStations,
        sleepTimer,
        setSleepTimer,
        searchQuery,
        setSearchQuery,
        view,
        setView,
        selectionTime,
        selectedTimeZone,
        selectCountry,
        playStation,
        toggleFavorite,
        isStationFavorite,
        markIconAsBroken,
        isIconBroken
    };

    return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
};
