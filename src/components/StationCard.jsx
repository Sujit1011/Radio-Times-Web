import React, { useState } from 'react';
import { useRadio } from '../context/RadioContext';
import { HiPlay, HiPause, HiHeart, HiOutlineHeart, HiOutlineVolumeUp } from 'react-icons/hi';
import './styles/StationCard.css';
import { RiBroadcastLine } from 'react-icons/ri';
import { fetchLiveMetadata } from '../utils/metadataFetcher';
/**
 * StationCard Component
 * Renders an individual radio station as a card in the grid.
 * Features:
 * - Displays station logo (with automatic proxying and broken link handling)
 * - Real-time metadata syncing (shows 'Now Playing' when station is active)
 * - One-click playback and favorite toggling
 * - Bitrate and codec information display
 * 
 * @param {Object} props
 * @param {Object} props.station - The station data object from Radio Browser API.
 * @returns {JSX.Element} The rendered station card.
 */
const StationCard = ({ station }) => {
    const {
        currentStation, isPlaying, playStation,
        toggleFavorite, isStationFavorite,
        markIconAsBroken, isIconBroken
    } = useRadio();
    const [imgError, setImgError] = useState(false);
    const [liveMetadata, setLiveMetadata] = useState(null);

    const isActive = currentStation?.stationuuid === station.stationuuid;
    const isFav = isStationFavorite(station.stationuuid);
    const isBroken = isIconBroken(station.favicon);

    // Fetch and sync metadata for ACTIVE station card
    React.useEffect(() => {
        let interval;
        const updateMetadata = async () => {
            if (isActive && isPlaying) {
                const song = await fetchLiveMetadata(station.url_resolved || station.url);
                if (song) setLiveMetadata(song);
            } else {
                setLiveMetadata(null);
            }
        };

        updateMetadata();
        if (isActive && isPlaying) {
            interval = setInterval(updateMetadata, 30000);
        }

        return () => clearInterval(interval);
    }, [isActive, isPlaying, station]);

    const handlePlay = (e) => {
        e.stopPropagation();
        playStation(station);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        toggleFavorite(station);
    };

    const handleImgError = () => {
        setImgError(true);
        if (station.favicon) markIconAsBroken(station.favicon);
    };

    return (
        <div className={`glass-card h-100 p-3 d-flex flex-column gap-3 animate-fadeIn station-card-hover ${isActive ? 'active-station-card' : ''}`}>
            {/* Station Header: Icon & Info */}
            <div className="d-flex align-items-start gap-3">
                <div className="flex-shrink-0 glass-panel d-flex align-items-center justify-content-center overflow-hidden"
                    style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'var(--color-bg-tertiary)' }}>
                    {station.favicon && !imgError && !isBroken ? (
                        <img
                            src={`https://corsproxy.io/?${encodeURIComponent(station.favicon)}`}
                            alt={station.name}
                            className="w-100 h-100 object-fit-cover"
                            onError={handleImgError}
                            loading="lazy"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <RiBroadcastLine size={32} className="text-muted opacity-50" />
                    )}
                </div>

                <div className="flex-grow-1 min-width-0">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="min-width-0 flex-grow-1">
                            <h6 className={`mb-1 text-truncate station-card-title ${isActive ? 'text-accent' : 'text-white'}`}>
                                {station.name}
                            </h6>
                            {isActive && liveMetadata && (
                                <div className="animate-fadeIn mb-1">
                                    <span className="text-accent fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <span className="animate-pulse me-1">●</span> Now Playing:
                                    </span>
                                    <p className="text-white-50 extra-small mb-0 text-truncate fw-medium">
                                        {liveMetadata}
                                    </p>
                                </div>
                            )}
                            <p className="text-muted extra-small mb-0 text-truncate">
                                {station.state ? `${station.state}, ` : ''}{station.country}
                            </p>
                        </div>
                        <button
                            onClick={handleFavorite}
                            className="btn btn-link p-0 text-decoration-none shadow-none"
                            style={{ color: isFav ? 'var(--color-error)' : 'rgba(255,255,255,0.25)', transition: 'all 0.3s ease' }}
                        >
                            {isFav ? <HiHeart size={22} className="animate-pulse" /> : <HiOutlineHeart size={22} />}
                        </button>
                    </div>

                    <div className="d-flex flex-wrap gap-1 mt-2 overflow-hidden">
                        {station.tags && station.tags.split(',').slice(0, 2).map((tag, idx) => (
                            tag.trim() && (
                                <span key={idx} className="badge fw-semibold opacity-75 text-truncate" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '100%' }}>
                                    {tag.trim().toUpperCase()}
                                </span>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Station Footer: Stats & Play */}
            <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10">
                <div className="d-flex align-items-center gap-3">
                    {station.bitrate > 0 && (
                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px', fontWeight: '500' }}>
                            <span className="bg-success rounded-circle" style={{ width: '5px', height: '5px' }}></span>
                            {station.bitrate}k
                        </div>
                    )}
                    <div className="badge glass-panel text-muted fw-normal" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {station.codec || 'MP3'}
                    </div>
                </div>

                <button
                    className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 station-play-btn ${isActive && isPlaying ? 'btn-outline-primary border-2' : 'btn-primary'}`}
                    onClick={handlePlay}
                    style={{ width: '48px', height: '48px', flexShrink: 0 }}
                >
                    {isActive && isPlaying ? (
                        <HiPause size={28} />
                    ) : (
                        <HiPlay size={28} className="ms-1" />
                    )}
                </button>
            </div>

        </div>
    );
};

export default StationCard;
