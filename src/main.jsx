/**
 * main.jsx
 * Entry point for the Radio Times Web application.
 * Responsibility: Renders the React root, injects global styles, 
 * and wraps the application in the RadioProvider context.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './vendor/bootstrap.min.css'
import './vendor/bootstrap.bundle.min.js'
import './index.css'
import { RadioProvider } from './context/RadioContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RadioProvider>
            <App />
        </RadioProvider>
    </React.StrictMode>,
)
