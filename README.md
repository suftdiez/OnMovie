# OnMovie 🎬

Platform web untuk menjelajahi informasi film dan serial TV menggunakan TMDB API.

## 📁 Project Structure

```
OnMovie/
├── frontend/       # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/        # API service
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── data/       # Mock data
│   └── ...
├── backend/        # Express.js + TMDB API
│   ├── server.js       # Express server & routes
│   ├── tmdbApi.js      # TMDB API service
│   └── .env            # Environment variables
└── package.json    # Root scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- TMDB API Key (get from https://www.themoviedb.org/settings/api)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Configuration

Create `backend/.env`:
```
NODE_ENV = development
PORT = 8080
TMDB_API_KEY = your_tmdb_api_key_here
TMDB_BASE_URL = https://api.themoviedb.org/3
TMDB_IMAGE_URL = https://image.tmdb.org/t/p/w500
```

### Running the App

```bash
# From root directory - run both frontend & backend
npm run dev

# Or run separately:
# Terminal 1 - Backend (Port 8080)
cd backend && npm start

# Terminal 2 - Frontend (Port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173

## ✨ Features

- 🔥 **Trending** - Trending movies & series
- 🎬 **Browse** - Popular, latest, top-rated content
- 🔍 **Search** - Search movies & series
- 👥 **Cast & Crew** - Actor information on detail pages
- 🎯 **Similar/Recommendations** - Related content suggestions
- 📱 **Responsive** - Works on all devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Express.js |
| API | TMDB (TheMovieDB) |

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/movies/latest` | Now playing movies |
| `/movies/popular` | Popular movies |
| `/movies/top-rated` | Top rated movies |
| `/movies/upcoming` | Upcoming movies |
| `/movies/:id/stream` | Movie details |
| `/movies/:id/credits` | Cast & crew |
| `/movies/:id/similar` | Similar movies |
| `/trending/movies` | Trending movies |
| `/series/popular` | Popular series |
| `/search?s=query` | Search |

## 📄 License

MIT
