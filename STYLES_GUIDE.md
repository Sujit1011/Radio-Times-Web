# Technical Documentation: Modular CSS Architecture

This document describes the design decisions and implementation details for the project's styling layer.

## 🎨 Global Design System (`src/index.css`)

The application follows a **Midnight Material** design system. All core tokens are defined in the global `:root` scope:

- **Theme**: HSL-based palette for precise accessibility control.
- **Material Design**: Uses elevation variables (`--material-bg-elevated`) instead of traditional box-shadows for a cleaner, modern look.
- **Glassmorphism**: Standardized `.glass-panel` and `.glass-card` classes for consistent UI transparency.

## 📦 Component Encapsulation

Each major UI component now owns its own stylesheet (e.g., `AudioPlayer.css`). This provides:
1. **Maintainability**: Changes to the player UI logic and appearance are localized to one folder.
2. **Speed**: Vite bundles only the required styles if using dynamic imports (future-proof).
3. **Isolation**: Reduces the risk of "CSS Leaks" where styles from one component break another.

## ⚡ Animation Engine

Animations are centralized in specific component files to reduce global bloat:
- **AudioPlayer.css**: Handles `float`, `marquee`, and `wave` (visualizer) animations.
- **SelectionTimer.css**: Handles the `animate-fadeIn` for new selections.
- **Header.css**: Manages search-bar transitions.

## 🛠️ Localized Dependencies

To ensure zero tracking, the standard Bootstrap bundle is imported directly into the JavaScript build graph:
```javascript
// main.jsx
import './vendor/bootstrap.min.css';
import './vendor/bootstrap.bundle.min.js';
```
This allows Vite to hash and optimize these assets alongside our source code.
