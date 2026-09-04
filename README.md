# Band App

A band management application for organizing songs, gigs, and setlists. Built for musicians to manage their repertoire, plan performances, and generate PDF setlists.

## Features

- 🎵 **Song Management** - Organize your band's song library with details like artist, tempo, groove patterns, and practice notes
- 🎸 **Multi-Instrument Support** - Track who starts each song, featured instruments, and solo order
- 📅 **Gig Planning** - Schedule gigs with venue information and date tracking
- 📋 **Setlist Builder** - Create setlists with Set One, Set Two, and Pocket (backup) songs
- 📄 **PDF Export** - Generate printable setlists for your gigs
- 👥 **Multi-Band Support** - Manage multiple bands from a single account
- 🔐 **Role-Based Access** - Different views for drummers, vocalists, guitarists, and sound engineers

## User Roles

The app supports different user roles, each with a tailored experience when viewing and interacting with songs.

### Available Users

| User | Song Card Click Action | Song Card Notes |
|------|------------------------|-----------------|
| **Vocals** | Opens Genius lyrics search | Shows who starts the song |
| **Guitars** | Opens Ultimate Guitar tab search | Shows who starts the song |
| **Mixer** | Opens YouTube Music video | Shows who starts, featured instruments, and solo order |

### How It Works

When a user clicks on a song card, the app opens the appropriate external resource based on their role:

- **Vocals** - Searches [Genius](https://genius.com) for lyrics to help with memorization and performance
- **Guitars** - Searches [Ultimate Guitar](https://ultimate-guitar.com) for chord charts and tabs
- **Mixer** - Opens the song on [YouTube Music](https://youtube.com) for audio reference during sound check

The song card also displays role-specific information:
- All users see who starts each song (drums, bass, guitar, etc.)
- Mixers additionally see featured instruments and the solo order to help with live mixing

## Tech Stack

- **Frontend**: React 19 + React Router 7 (SPA mode)
- **Styling**: TailwindCSS + DaisyUI
- **Database**: Firebase Firestore
- **Testing**: Vitest + React Testing Library
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm (recommended) or npm
- Firebase project with Firestore enabled

### Installation

```bash
pnpm install
```

### Configuration

Create a Firebase project and configure your credentials in `app/config/firebase.ts`.

### Development

Start the development server:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm start` | Serve production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run Biome linting and TypeScript type checking |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm format` | Format code with Biome |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
app/
├── components/     # Reusable UI components
│   └── ui/         # Base UI components (inputs, checklists, etc.)
├── config/         # Firebase configuration
├── contexts/       # React context providers
├── firestore/      # Firestore types and converters
├── hooks/          # Custom React hooks
├── loaders/        # Data loading utilities
├── routes/         # Route components
├── test/           # Shared test utilities and mocks
└── utils/          # General utilities
```

## Building for Production

```bash
pnpm build
```

The build output will be in the `dist/` directory.

## Deployment

### Docker

```bash
docker build -t band-app .
docker run -p 3000:3000 band-app
```

### Static Hosting

The built app can be deployed to any static hosting service:
- Vercel
- Netlify
- Firebase Hosting
- GitHub Pages

