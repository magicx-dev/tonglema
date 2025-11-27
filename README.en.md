**English** | [中文](README.md)

# TongLeMa

<div align="center">
  <img src="docs/light.png" alt="TongLeMa - Network Connectivity Dashboard" width="100%"/>
</div>

**TongLeMa** (通了吗) is an open-source network connectivity dashboard designed to help users quickly check the latency and connectivity status of popular global services in real-time.

🌐 **Live Demo**: [TongLeMa.com](https://tonglema.com)

## Screenshots

### Light Theme

<table>
<tr>
<td width="50%">
<img src="docs/light.png" alt="Light Theme - Main View" />
</td>
<td width="50%">
<img src="docs/light2.png" alt="Light Theme - Detailed View" />
</td>
</tr>
</table>

### Dark Theme

<table>
<tr>
<td width="50%">
<img src="docs/dark.png" alt="Dark Theme - Main View" />
</td>
<td width="50%">
<img src="docs/dark2.png" alt="Dark Theme - Detailed View" />
</td>
</tr>
</table>

## Features

* **Real-time Connectivity Check**: One-click to check the connectivity and latency of multiple popular services.
* **Visual Dashboard**: Beautiful grid-based status cards with color-coded latency indicators for quick visual assessment.
* **Location Detection**: Automatically detects your network location (country/city) and displays with flag emoji.
* **Bilingual Support**: Full support for English and Chinese (简体中文) with seamless language switching.
* **Dark/Light Theme**: Modern UI with dark and light theme support, following system preferences.
* **Auto Refresh**: Configurable automatic refresh interval to keep status up-to-date.
* **Privacy First**: Runs 100% in your browser using Fetch API. No user data collected or sent to any backend server.
* **Categories**: Organized by service categories (AI, Search, Social, Media, Dev) for easy navigation.
* **Detailed Stats**: Shows online services count, average latency, and network mode information.

## Tech Stack

* **React 19** - UI framework
* **TypeScript** - Type safety
* **Vite** - Build tool and dev server
* **Tailwind CSS** - Utility-first CSS framework
* **Framer Motion** - Animation library
* **Lucide React** - Icon library

## Installation

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/simonxmau/tonglema.git
   cd tonglema
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

### Production Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

The built files will be in the `dist` directory, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Live Demo

You can also access the online version directly without installation:

🌐 [TongLeMa.com](https://tonglema.com) - Try it now

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=simonxmau/tonglema&type=date&legend=top-left)](https://www.star-history.com/#simonxmau/tonglema&type=date&legend=top-left)


## Development & Contribution

Contributions and suggestions are welcome! You can participate by:

* Forking the project
* Submitting issues
* Creating pull requests
* Suggesting new features or improvements

## License

MIT

## About

TongLeMa (通了吗) - "Is it connected?" - A real-time network connectivity monitoring tool that helps you check the status of popular global services at a glance.

---

⭐ If you find this project useful, please consider giving it a star on GitHub!

