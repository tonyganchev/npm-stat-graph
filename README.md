<img src="public/favicon.svg" width="40" height="40" alt="icon" style="float: left; margin-right: 10px" />

# npm-stat-graph

An interactive dashboard for visualizing download trends across multiple npm
packages inspired by <https://npm-stat.com/charts.html>.

[![GitHub Pages Deployment](https://github.com/tonyganchev/npm-stat-graph/actions/workflows/deploy.yml/badge.svg)](https://tonyganchev.github.io/npm-stat-graph/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build with Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Built with React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)

🚀 **[Live Version](https://tonyganchev.github.io/npm-stat-graph/)**

## ✨ Features

- **Multi-Package Search**: Compare multiple npm packages at once with
  color-coded identifiers.
- **Smart Date Ranges**: Quick presets (7 days, 30 days, 1 year, etc.) and full
  custom date range support.
- **Granular Visualization**: View data trends grouped by day, week, month, or
  even year.
- **State Persistence**: Your search queries and visual preferences are
  automatically synced to the URL and `localStorage`.
- **Responsive Charts**: Beautifully rendered using
  [Recharts](https://recharts.org/) with full tooltip support.
- **Multiple Visualization Modes** - Line or bar charts; absolute statistics or
  percentage changes.

## 🚀 Getting Started

1. **Run Development Server**
   ```bash
   pnpm dev
   ```

2. **Build for Production**
   ```bash
   pnpm build
   ```

## 📖 License

This project is licensed under the MIT License - see the
[LICENSE.md](LICENSE.md) file for details.

---

© 2026 Tony Ganchev. Built with ❤️ for the npm community.
