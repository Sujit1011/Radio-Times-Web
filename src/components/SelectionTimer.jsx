import React, { useState, useEffect } from 'react';
import { useRadio } from '../context/RadioContext';
import { HiClock, HiCalendar } from 'react-icons/hi';
import './styles/SelectionTimer.css';

/**
 * SelectionTimer Component
 * Provides a real-time clock and date display for the user.
 * It can toggle between the user's local time and the localized time of a selected country,
 * using a custom timezone mapping for a better UX.
 * 
 * @returns {JSX.Element} The rendered time and date display
 */
const SelectionTimer = () => {
    const { selectionTime, selectedTimeZone, allCountries, selectedCountry } = useRadio();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const countryName = allCountries.find(c => c.code === selectedCountry)?.name || selectedCountry?.toUpperCase();

    const formatDate = (date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: selectedTimeZone || undefined
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: selectedTimeZone || undefined
        });
    };

    return (
        <div key={selectedCountry} className="selection-timer-container glass-panel p-3 mb-3 animate-fadeIn">
            <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="text-white-50 extra-small fw-bold text-uppercase tracking-wider">
                    {selectedTimeZone ? `Time in ${countryName}` : 'Your Local Time'}
                </span>
                <div className="status-dot bg-success animate-pulse"
                    style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
            </div>

            <div className="d-flex flex-column">
                <div className="d-flex align-items-baseline gap-2">
                    <HiClock className="text-accent opacity-75" size={14} />
                    <span className="text-white fw-bold h5 mb-0" style={{ letterSpacing: '0.5px' }}>
                        {formatTime(currentTime)}
                    </span>
                </div>
                <div className="d-flex align-items-center gap-2 mt-1 opacity-50">
                    <HiCalendar size={12} className="text-white" />
                    <span className="extra-small text-white" style={{ fontSize: '10px' }}>
                        {formatDate(currentTime)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SelectionTimer;
