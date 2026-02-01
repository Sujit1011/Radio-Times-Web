import React, { useState } from 'react';
import Header from './components/Header';
import CountrySelector from './components/CountrySelector';
import StationList from './components/StationList';
import AudioPlayer from './components/AudioPlayer';
import { useRadio } from './context/RadioContext';

/**
 * App Component
 * The root component of the application shell.
 * Responsibility: Manages the high-level layout, including the Header, 
 * the responsive Sidebar (CountrySelector), the StationList, and the persistent AudioPlayer.
 * 
 * @returns {JSX.Element} The rendered application layout
 */
function App() {
    const { view } = useRadio();

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />

            <main className="container flex-grow-1" style={{ paddingBottom: '160px', paddingTop: '100px' }}>
                <div className="row g-4">
                    {/* Sidebar for Country Selection on Desktop */}
                    <aside className="col-lg-3 d-none d-lg-block sticky-top" style={{ top: '100px', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        <CountrySelector />
                    </aside>

                    {/* Main Content Area */}
                    <section className="col-lg-9 col-12">
                        {/* Mobile Country Selector (horizontal scroll) */}
                        <div className="d-lg-none mb-4">
                            <CountrySelector layout="horizontal" />
                        </div>

                        <StationList />
                    </section>
                </div>
            </main>

            <AudioPlayer />
        </div>
    );
}

export default App;
