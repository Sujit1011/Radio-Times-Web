import React, { useEffect, useRef } from 'react';
import { useRadio } from '../context/RadioContext';
import StationCard from './StationCard';
import { RiRadio2Line } from 'react-icons/ri';
import { HiHeart, HiCollection, HiChevronDown } from 'react-icons/hi';
import './styles/StationList.css';

/**
 * StationList Component
 * Orchestrates the display of radio stations in a responsive grid.
 * Key Features:
 * - Infinite scrolling with IntersectionObserver
 * - Dynamic view switching (All, Favorites, Recent)
 * - Skeleton loading states for better UX
 * - No-results handling for empty search or favorites
 * 
 * @returns {JSX.Element} The rendered station grid
 */
const StationList = () => {
    const {
        stations,
        totalCount,
        hasMore,
        loadMore,
        view,
        favorites,
        recentStations,
        isLoading,
        selectedCountry,
        allCountries,
        searchQuery
    } = useRadio();

    const loaderRef = useRef(null);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                loadMore();
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasMore, isLoading, loadMore]);

    const country = selectedCountry ? allCountries.find(c => c.code === selectedCountry.toLowerCase()) : null;
    const currentCountryName = country ? country.name : (selectedCountry ? selectedCountry : 'International');

    let displayStations = [];
    if (view === 'favorites') displayStations = favorites;
    else if (view === 'recent') displayStations = recentStations;
    else displayStations = stations;

    const hasResults = displayStations.length > 0;

    const getHeaderText = () => {
        if (view === 'favorites') return <><HiHeart className="text-danger" /> Favorite Stations</>;
        if (view === 'recent') return <><HiCollection className="text-accent" /> Recently Played</>;
        if (!selectedCountry) return <><HiCollection className="text-accent" /> International Stations</>;
        return <><HiCollection className="text-accent" /> Stations in {currentCountryName}</>;
    };

    if (isLoading && view === 'all') {
        return (
            <div className="row g-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4">
                        <div className="skeleton rounded-4" style={{ height: '200px' }} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* List Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                    <h3 className="h3 mb-1 d-flex align-items-center gap-2 text-white">
                        {getHeaderText()}
                    </h3>
                    <p className="text-muted small mb-0">
                        {view === 'favorites'
                            ? `You have saved ${favorites.length} stations`
                            : view === 'recent'
                                ? `History of your last ${recentStations.length} played stations`
                                : `Showing ${stations.length} of ${totalCount} stations`}
                    </p>
                </div>
            </div>

            {hasResults ? (
                <>
                    <div className="row g-4">
                        {displayStations.map((station) => (
                            <div key={station.stationuuid} className="col-12 col-md-6 col-lg-4">
                                <StationCard station={station} />
                            </div>
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    {hasMore && view === 'all' && (
                        <div ref={loaderRef} className="d-flex justify-content-center mt-5 py-5">
                            <div className="btn glass-panel btn-sm text-white animate-pulse">
                                <HiChevronDown className="me-2" /> Loading more stations...
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-panel text-center py-5 px-4 animate-fadeIn my-5" style={{ opacity: 0.9 }}>
                    <div className="mb-4">
                        <RiRadio2Line size={80} className="text-muted opacity-25" />
                    </div>
                    <h3 className="h4 text-white mb-2">{searchQuery ? 'No matches found' : 'No stations here'}</h3>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                        {view === 'favorites'
                            ? "Your collection is empty. Browse the world's stations and add some favorites!"
                            : view === 'recent'
                                ? "You haven't played any stations yet. Start your journey by picking a station!"
                                : "Try adjusting your search filters or exploring another country."}
                    </p>
                    {view !== 'all' && (
                        <button className="btn btn-primary px-4 rounded-pill" onClick={() => setView('all')}>
                            Explore Stations
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default StationList;
