# Downloader App

A modern, self-hosted download manager built with **Next.js**.

## Features
- **Next.js Frontend**: Responsive and modern UI.
- **Zone-Telechargement Integration**: Search and download movies directly.
- **1fichier Support**: Automatically extracts and downloads files from 1fichier links.
- **Plex Integration**: Automatically scans your Plex library upon download completion.
- **User Authentication**: Secure login with session management.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn/UI.

## Quick Start

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration
The application stores its configuration in `config/settings.json`.
You can copy the example file to get started:
```bash
cp config/settings.example.json config/settings.json
```

## Documentation
- [API Documentation](docs/API_DOCUMENTATION.md)

## License
MIT
