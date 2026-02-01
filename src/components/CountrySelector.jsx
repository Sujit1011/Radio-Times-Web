import React, { useState, useMemo } from 'react';
import { useRadio } from '../context/RadioContext';
import { HiSearch, HiGlobeAlt } from 'react-icons/hi';
import SelectionTimer from './SelectionTimer';

/**
 * CountrySelector Component
 * Provides a UI for searching and selecting radio stations by country.
 * Supports both vertical (sidebar) and horizontal (mobile) layouts.
 * 
 * @param {Object} props
 * @param {('vertical'|'horizontal')} props.layout - The layout orientation of the selector.
 * @returns {JSX.Element} The rendered country selection list
 */
const CountrySelector = ({ layout = 'vertical' }) => {
    const { selectedCountry, selectCountry, allCountries, isCountriesLoading } = useRadio();
    const [filter, setFilter] = useState('');

    const filteredCountries = useMemo(() => {
        return allCountries.filter(c =>
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            c.code.toLowerCase().includes(filter.toLowerCase())
        );
    }, [allCountries, filter]);

    if (layout === 'horizontal') {
        return (
            <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="search-container-premium flex-grow-1" style={{ maxWidth: '200px', minHeight: '36px' }}>
                        <HiSearch className="text-white-50" size={14} />
                        <input
                            type="text"
                            className="search-input-premium"
                            placeholder="Find..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                        />
                    </div>
                    <div className="d-flex gap-2 overflow-auto pb-2 flex-grow-1" style={{ scrollbarWidth: 'none' }}>
                        {isCountriesLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton rounded-pill" style={{ minWidth: '100px', height: '32px' }} />
                            ))
                        ) : (
                            filteredCountries.slice(0, 15).map((country) => (
                                <button
                                    key={country.code}
                                    className={`btn btn-sm text-nowrap d-flex align-items-center gap-2 px-3 ${selectedCountry === country.code ? 'btn-primary' : 'glass-panel text-white opacity-75'}`}
                                    onClick={() => selectCountry(country.code)}
                                    style={{ borderRadius: '12px' }}
                                >
                                    <img
                                        src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                        alt={country.name}
                                        style={{ width: '16px', height: '11px', borderRadius: '1px' }}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <span style={{ fontSize: '0.75rem' }}>{country.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel d-flex flex-column h-100 p-3" style={{ gap: '1rem' }}>
            <SelectionTimer />

            <div className="d-flex align-items-center justify-content-between mb-1">
                <h5 className="mb-0 text-white font-weight-bold">Countries</h5>
                <span className="badge glass-panel text-muted fw-normal">{allCountries.length}</span>
            </div>

            <div className="search-container-premium mb-2">
                <HiSearch className="text-white-50" size={18} />
                <input
                    type="text"
                    className="search-input-premium"
                    placeholder="Search countries..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column gap-1">
                {isCountriesLoading ? (
                    [...Array(15)].map((_, i) => (
                        <div key={i} className="skeleton rounded-2 mb-1" style={{ width: '100%', height: '40px', opacity: 1 - (i * 0.05) }} />
                    ))
                ) : (
                    filteredCountries.map((country) => (
                        <button
                            key={country.code}
                            onClick={() => selectCountry(country.code)}
                            className={`btn btn-sm d-flex align-items-center justify-content-between text-start border-0 px-3 py-2 ${selectedCountry === country.code ? 'btn-primary' : 'text-white-50 hover-text-white'}`}
                            style={{
                                borderRadius: '8px',
                                background: selectedCountry === country.code ? '' : 'transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <img
                                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                    alt={country.name}
                                    style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/20x14?text=?'; }}
                                />
                                <div className="d-flex flex-column">
                                    <span style={{ fontSize: '0.85rem' }}>{country.name}</span>
                                    <span className="extra-small opacity-50" style={{ fontSize: '10px' }}>{country.count} stations</span>
                                </div>
                            </div>
                            {selectedCountry === country.code && (
                                <div className="bg-white rounded-circle" style={{ width: '4px', height: '4px' }} />
                            )}
                        </button>
                    ))
                )}
                {filteredCountries.length === 0 && (
                    <div className="text-muted text-center py-4">
                        <HiGlobeAlt size={24} className="mb-2 opacity-50" />
                        <p className="small mb-0">No countries found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CountrySelector;
