import React, { useState } from 'react';
import { useRadio } from '../context/RadioContext';
import { HiSearch, HiHeart, HiGlobeAlt, HiCollection, HiClock } from 'react-icons/hi';
import './styles/Header.css';
import { RiRadio2Line } from 'react-icons/ri';

/**
 * Header Component
 * The top-level navigation and branding component.
 * Features:
 * - Application branding and refresh capability
 * - Global search bar for stations and genres
 * - View switching (Browse, Favorites, Recently Played)
 * - Sleep Timer controls and countdown display
 * 
 * @returns {JSX.Element} The rendered navigation header
 */
const Header = () => {
    const {
        searchQuery, setSearchQuery,
        view, setView,
        favorites, recentStations,
        sleepTimer, setSleepTimer, isPlaying
    } = useRadio();
    const [showTimerMenu, setShowTimerMenu] = useState(false);

    const formatTimer = (seconds) => {
        if (!seconds) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSetTimer = (mins) => {
        setSleepTimer(mins === 0 ? null : mins * 60);
        setShowTimerMenu(false);
    };

    return (
        <header className="glass-panel position-fixed top-0 start-0 end-0 py-2" style={{ zIndex: 1050, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
            <div className="container d-flex align-items-center justify-content-between gap-3">
                {/* Logo */}
                <div
                    className="d-flex align-items-center gap-2 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => { window.location.reload(); }}
                >
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent-gradient)' }}>
                        <RiRadio2Line size={24} color="white" />
                    </div>
                    <h1 className="h4 mb-0 d-none d-sm-block" style={{ letterSpacing: '-0.5px' }}>
                        <span className="text-gradient fw-bold">Radio</span>
                        <span className="text-white fw-light">Times</span>
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="flex-grow-1 mx-lg-4 d-none d-md-block" style={{ maxWidth: '400px' }}>
                    <div className="search-container-premium" style={{ borderRadius: '50px' }}>
                        <HiSearch className="text-white-50" size={20} />
                        <input
                            type="text"
                            className="search-input-premium"
                            placeholder="Find stations, genres, vibes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${view === 'all' ? 'btn-primary' : 'glass-panel text-white opacity-75 hover-opacity-100'}`}
                        style={{ fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={() => setView('all')}
                    >
                        <HiGlobeAlt size={18} />
                        <span className="d-none d-lg-block">Browse</span>
                    </button>

                    <button
                        className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${view === 'recent' ? 'btn-primary' : 'glass-panel text-white opacity-75 hover-opacity-100'}`}
                        style={{ fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={() => setView('recent')}
                    >
                        <HiCollection size={18} />
                        <span className="d-none d-lg-block">Recent</span>
                    </button>

                    <button
                        className={`btn position-relative d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${view === 'favorites' ? 'btn-primary' : 'glass-panel text-white opacity-75 hover-opacity-100'}`}
                        style={{ fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={() => setView('favorites')}
                    >
                        <HiHeart size={18} />
                        <span className="d-none d-lg-block">Favorites</span>
                        {favorites.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1" style={{ fontSize: '9px', minWidth: '18px', height: '18px' }}>
                                {favorites.length}
                            </span>
                        )}
                    </button>

                    {/* Sleep Timer in Nav */}
                    <div className="position-relative ms-2">
                        <button
                            className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all ${sleepTimer ? 'btn-warning text-dark fw-bold' : 'glass-panel text-white opacity-75 hover-opacity-100'}`}
                            style={{ fontSize: '0.85rem', fontWeight: '600' }}
                            onClick={() => setShowTimerMenu(!showTimerMenu)}
                            title="Set Sleep Timer"
                        >
                            <HiClock size={18} />
                            <span>{sleepTimer ? formatTimer(sleepTimer) : 'Timer'}</span>
                        </button>

                        {showTimerMenu && (
                            <div className="position-absolute top-100 end-0 mt-2 p-2 rounded-3 animate-fadeIn shadow-lg" style={{ minWidth: '130px', zIndex: 2000, background: 'var(--material-bg-elevated)', border: '1px solid var(--material-border-bright)' }}>
                                <div className="extra-small fw-bold text-white-50 mb-2 px-2 border-bottom border-white border-opacity-10 pb-1 text-center">Sleep in...</div>
                                <div className="d-grid gap-1">
                                    {[15, 30, 45, 60].map(mins => (
                                        <button key={mins} onClick={() => handleSetTimer(mins)} className="btn btn-sm text-white opacity-75 hover-opacity-100 py-1 px-2 text-start" style={{ fontSize: '11px' }}>
                                            {mins} minutes
                                        </button>
                                    ))}
                                    {sleepTimer && (
                                        <button onClick={() => handleSetTimer(0)} className="btn btn-sm text-danger opacity-75 hover-opacity-100 py-1 px-2 text-start mt-1 border-top border-white border-opacity-10 pt-2" style={{ fontSize: '11px' }}>
                                            Stop Timer
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
