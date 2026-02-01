/**
 * AudioPlayer Component
 * A persistent playback engine and UI overlay.
 * Responsibilities:
 * - Handling HTML5 Audio playback and volume control.
 * - Synchronizing with the Media Session API for system-level controls.
 * - Managing buffering, playback errors, and stream proxy fallback.
 * - Fetching and displaying real-time 'Now Playing' metadata using a marquee animation.
 * 
 * @returns {JSX.Element} The rendered global audio player
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRadio } from '../context/RadioContext';
import {
    HiPlay, HiPause, HiVolumeUp, HiVolumeOff,
    HiHeart, HiOutlineHeart, HiGlobeAlt, HiRefresh, HiClock
} from 'react-icons/hi';
import { HiShieldCheck } from 'react-icons/hi2';
import './styles/AudioPlayer.css';
import { RiRadio2Line } from 'react-icons/ri';
import { fetchLiveMetadata } from '../utils/metadataFetcher';

const AudioPlayer = () => {
    const {
        currentStation,
        isPlaying,
        setIsPlaying,
        toggleFavorite,
        isStationFavorite,
        sleepTimer,
        setSleepTimer
    } = useRadio();

    const audioRef = useRef(null);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);
    const [useProxy, setUseProxy] = useState(false);
    const [liveSong, setLiveSong] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showTimerMenu, setShowTimerMenu] = useState(false);

    const getStreamUrl = useCallback(() => {
        if (!currentStation) return '';
        const originalUrl = currentStation.url_resolved || currentStation.url;

        // AUTO-PROTECTION: Automatically proxy any insecure HTTP stream to upgrade it to HTTPS
        if (originalUrl.startsWith('http://') || useProxy) {
            return `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
        }

        return originalUrl;
    }, [currentStation, useProxy]);

    // Metadata Sync Function
    const handleSyncMetadata = useCallback(async () => {
        if (!currentStation || !isPlaying) return;
        setIsSyncing(true);
        try {
            const song = await fetchLiveMetadata(currentStation.url_resolved || currentStation.url);
            if (song) setLiveSong(song);
        } catch (e) {
            console.error("Metadata fetch error:", e);
        } finally {
            setIsSyncing(false);
        }
    }, [currentStation, isPlaying]);

    // Handle station change and reset state
    useEffect(() => {
        if (currentStation) {
            setError(null);
            setUseProxy(false);
            setIsBuffering(true);
            setLiveSong(null); // Reset metadata on station change

            if (audioRef.current) {
                audioRef.current.load();
            }
        }
    }, [currentStation]);

    // Periodically fetch metadata
    useEffect(() => {
        let interval;
        if (isPlaying && currentStation) {
            // Initial fetch
            handleSyncMetadata();
            // Poll every 30 seconds
            interval = setInterval(handleSyncMetadata, 30000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStation, handleSyncMetadata]);

    // Sync state with audio element
    useEffect(() => {
        if (!audioRef.current || !currentStation) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error("Playback error:", err);

                    const isHttps = window.location.protocol === 'https:';
                    const streamUrl = getStreamUrl();
                    const isHttpStream = streamUrl && streamUrl.startsWith('http:');

                    if (!useProxy) {
                        if (isHttps && isHttpStream) {
                            setError("Chrome blocks plain HTTP streams on HTTPS sites. Try Proxy!");
                        } else {
                            setError("Stream blocked by CORS or server offline.");
                        }
                    } else {
                        setError("Stream unavailable even via proxy.");
                    }
                    setIsPlaying(false);
                });
            }

            // Media Session API for system-level controls
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: liveSong || currentStation.name,
                    artist: liveSong ? currentStation.name : `${currentStation.state ? currentStation.state + ', ' : ''}${currentStation.country}`,
                    album: currentStation.tags || 'Radio Broadcast',
                    artwork: [
                        { src: currentStation.favicon || 'https://raw.githubusercontent.com/Sujit1011/Radio-Times-Web/main/public/radio-icon.png', sizes: '512x512', type: 'image/png' }
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
                navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentStation, setIsPlaying, useProxy, getStreamUrl]);

    // Volume control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    if (!currentStation) return null;

    const isFav = isStationFavorite(currentStation.stationuuid);

    const handleRetryWithProxy = () => {
        setError(null);
        setUseProxy(true);
        setIsPlaying(true);
    };

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
        <div className="player-container animate-fadeIn">
            <div className="player-island px-4">
                {/* Hidden Audio Element */}
                <audio
                    ref={audioRef}
                    src={getStreamUrl()}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    onCanPlay={() => setIsBuffering(false)}
                    onAbort={() => setIsBuffering(false)}
                    onError={() => {
                        if (!error) {
                            if (!useProxy) {
                                setError("Connection error. Try Proxy?");
                            } else {
                                setError("Stream could not be played.");
                            }
                        }
                        setIsPlaying(false);
                        setIsBuffering(false);
                    }}
                />

                {/* Left Section: Station Info */}
                <div className="d-flex align-items-center gap-3" style={{ width: '280px' }}>
                    <div className="flex-shrink-0 glass-panel d-flex align-items-center justify-content-center overflow-hidden position-relative"
                        style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#222' }}>
                        {currentStation.favicon ? (
                            <img src={currentStation.favicon.startsWith('http://') ? `https://corsproxy.io/?${encodeURIComponent(currentStation.favicon)}` : currentStation.favicon} alt="" className="w-100 h-100 object-fit-cover" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                            <RiRadio2Line size={24} className="text-muted" />
                        )}
                        {isPlaying && !isBuffering && (
                            <div className="visualizer-overlay">
                                <div className="bar" style={{ animationDelay: '0s' }}></div>
                                <div className="bar" style={{ animationDelay: '0.2s' }}></div>
                                <div className="bar" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                        <h6 className="text-white text-truncate mb-0" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                            {currentStation.name}
                        </h6>
                        <div className="d-flex align-items-center gap-1 text-muted extra-small opacity-75">
                            <span className="text-truncate">{currentStation.country}</span>
                            <span className="opacity-50">•</span>
                            <span>{currentStation.codec || 'MP3'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleFavorite(currentStation)}
                        className="btn btn-link p-0 text-decoration-none shadow-none opacity-50 hover-opacity-100 fav-toggle"
                        style={{ color: isFav ? 'var(--color-error)' : 'white' }}
                    >
                        {isFav ? <HiHeart size={18} /> : <HiOutlineHeart size={18} />}
                    </button>
                </div>

                {/* Center Section: Controls & Status */}
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center min-width-0 mx-2">
                    <button
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 mb-1"
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={isBuffering && isPlaying}
                        style={{ width: '46px', height: '46px' }}
                    >
                        {isBuffering && isPlaying ? (
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                        ) : isPlaying ? (
                            <HiPause size={26} />
                        ) : (
                            <HiPlay size={26} className="ms-1" />
                        )}
                    </button>

                    <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: '20px' }}>
                        {error ? (
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-danger small" style={{ fontSize: '10px' }}>{error}</span>
                            </div>
                        ) : isBuffering && isPlaying ? (
                            <span className="text-warning small text-uppercase fw-bold animate-pulse" style={{ fontSize: '9px', letterSpacing: '1px' }}>Buffering...</span>
                        ) : isPlaying ? (
                            <div className="d-flex align-items-center gap-2 w-100 px-2 overflow-hidden">
                                <div className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1 py-1 px-2 flex-shrink-0" style={{ fontSize: '8px' }}>
                                    <span className="bg-success rounded-circle" style={{ width: '4px', height: '4px' }}></span>
                                    LIVE {(currentStation.url_resolved || currentStation.url).startsWith('http://') ? <span className="opacity-75 ms-1">PROXIED</span> : <span className="opacity-75 ms-1">SECURE</span>}
                                </div>
                                <div className="flex-grow-1 marquee-container">
                                    <div className="marquee-content text-muted fw-medium" style={{ fontSize: '11px' }}>
                                        {liveSong ? (
                                            <>
                                                <span className="text-accent opacity-75 me-2" style={{ fontSize: '9px', fontWeight: '800' }}>NOW PLAYING:</span>
                                                <span className="text-white fw-bold me-4">{liveSong}</span>
                                                <span className="text-white opacity-30 me-2" style={{ fontSize: '9px', fontWeight: '800' }}>STATION:</span>
                                                <span className="me-4">{currentStation.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-white opacity-40 me-2" style={{ fontSize: '9px', fontWeight: '800' }}>BROADCASTING FROM:</span>
                                                <span className="text-white-50 me-4">{currentStation.name}</span>
                                                {currentStation.tags && (
                                                    <>
                                                        <span className="text-white opacity-30 me-2" style={{ fontSize: '9px', fontWeight: '800' }}>TAGS:</span>
                                                        <span className="me-4">{currentStation.tags.split(',').join(' • ')}</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {currentStation.homepage && <span className="ms-4 text-accent opacity-50" style={{ fontSize: '10px' }}>Visit official site for detailed playlist!</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <span className="text-muted small text-uppercase opacity-50 fw-bold" style={{ fontSize: '9px', letterSpacing: '1px' }}>Broadcast Paused</span>
                        )}
                    </div>
                </div>

                {/* Right Section: Volume */}
                <div className="d-flex align-items-center gap-3 justify-content-end player-volume" style={{ width: '150px' }}>
                    <button onClick={() => setIsMuted(!isMuted)} className="btn btn-link p-0 text-white opacity-50 shadow-none">
                        {isMuted || volume === 0 ? <HiVolumeOff size={18} /> : <HiVolumeUp size={18} />}
                    </button>
                    <div className="flex-grow-1" style={{ maxWidth: '80px' }}>
                        <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                setVolume(parseFloat(e.target.value));
                                setIsMuted(false);
                            }}
                        />
                    </div>
                </div>
            </div >
        </div >
    );
};

export default AudioPlayer;
