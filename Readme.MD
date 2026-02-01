# 🌍 Radio Times - World Radio Player

A premium, privacy-focused radio streaming application that allows you to explore over 30,000 stations worldwide with a state-of-the-art "Midnight Material" dark theme.

## ✨ Key Features

- **Global Exploration**: Browse stations from 150+ countries with live station counts and instant country filtering.
- **Privacy First (Zero-Tracking)**: No external CDNs, no Google Fonts, and zero background data leaks. Uses a secure CORS proxy for all external assets.
- **Advanced Metadata Engine**: Real-time "Now Playing" discovery across Shoutcast and Icecast protocols with automatic fallback strategies.
- **High-Contrast Search**: A custom "Punched-Out" search UI designed for maximum visibility across all devices and theme variations.
- **World Clock Integration**: Live local time display for every selected country using a localized IANA timezone database.
- **Smart Sleep Timer**: Integrated countdown timer in the navigation bar for global accessibility and consumption control.
- **Broken Icon Cache**: Session-wide intelligence that silences console errors and ensures a clean UI by remembering dead links.

## 🛠️ Technical Stack

- **Frontend**: React 18 & Vite
- **Architecture**: Context API + Custom Hooks for high-performance state management.
- **Styling**: Vanilla CSS (Modular Architecture) + Bootstrap 5.3 (Locally Hosted).
- **Documentation**: Comprehensive JSDoc coverage for the entire JSX codebase.
- **API**: Radio Browser Open API integration.

## 🔒 Security & Privacy

- **Hardened CSP**: Content Security Policy blocks all 3rd-party tracking scripts and external fonts.
- **HTTPS Enforcement**: Automatic proxying of HTTP favicons and audio streams through secure channels to prevent mixed-content blocks.
- **Data Sanitization**: All stream metadata and station info is cleaned before rendering to ensure application integrity.

## 📁 Project Structure

```text
src/
├── components/          # Documented React Components
│   ├── AudioPlayer.jsx  # Playback Engine & Logic
│   ├── CountrySelector.jsx # Sidebar & Mobile search
│   └── ...
├── context/             # Global State (RadioContext)
├── utils/               # Fetching, Metadata & Timezone DB
└── main.jsx             # Entry Point & Bundle Configuration
```

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Launch dev server**: `npm run dev`
3. **Build for production**: `npm run build`

---

*Built with precision for privacy-conscious audiophiles.*
