const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const tmdb = require("./tmdbApi");

const app = express();
const PORT = process.env.PORT || 3000;

// Developer info
const Developers = {
    name: "OnMovie API (TMDB)",
    author: "OnMovie Team",
    source: "TheMovieDB.org"
};

// Middleware
app.use(cors());
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Routes
app.get("/", (_, res) => {
    res.json({
        status: true,
        developers: Developers,
        message: "Welcome to OnMovie API powered by TMDB"
    });
});

// Movies
app.get("/movies/latest", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getLatestMovies(page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/movies/popular", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getPopularMovies(page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/movies/top-rated", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getTopRatedMovies(page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/movies/genres", async (_, res) => {
    try {
        const genres = await tmdb.getGenres();
        res.json({ status: true, developers: Developers, results: genres });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/movies/genre/:genre", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getMoviesByGenre(req.params.genre, page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/movies/:id/stream", async (req, res) => {
    try {
        const movie = await tmdb.getMovieDetails(req.params.id);
        if (!movie) {
            return res.status(404).json({ status: false, developers: Developers, message: "Movie not found" });
        }
        res.json({ status: true, developers: Developers, result: movie });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Search
app.get("/search", async (req, res) => {
    try {
        const query = req.query.s;
        if (!query) return res.status(400).json({ status: false, developers: Developers, message: "Missing search query (?s=)" });

        const results = await tmdb.searchMovies(query);
        res.json({ status: true, developers: Developers, results });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Series
app.get("/series/genres", async (_, res) => {
    try {
        const genres = await tmdb.getSeriesGenres();
        res.json({ status: true, developers: Developers, results: genres });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/series/genre/:genre", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getSeriesByGenre(req.params.genre, page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/series/popular", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getPopularSeries(page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/series/:id/stream", async (req, res) => {
    try {
        const series = await tmdb.getSeriesDetails(req.params.id);
        if (!series) {
            return res.status(404).json({ status: false, developers: Developers, message: "Series not found" });
        }
        res.json({ status: true, developers: Developers, result: series });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

app.get("/series/:id/", async (req, res) => {
    try {
        const series = await tmdb.getSeriesDetails(req.params.id);
        if (!series) {
            return res.status(404).json({ status: false, developers: Developers, message: "Series not found" });
        }
        res.json({ status: true, developers: Developers, result: series });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// ==================== NEW FEATURES ====================

// Trending Movies
app.get("/trending/movies", async (req, res) => {
    try {
        const timeWindow = req.query.time || "day"; // day or week
        const data = await tmdb.getTrendingMovies(timeWindow);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Trending Series
app.get("/trending/series", async (req, res) => {
    try {
        const timeWindow = req.query.time || "day";
        const data = await tmdb.getTrendingSeries(timeWindow);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Upcoming Movies
app.get("/movies/upcoming", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await tmdb.getUpcomingMovies(page);
        res.json({ status: true, developers: Developers, current_page: page, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Movie Credits (Cast & Crew)
app.get("/movies/:id/credits", async (req, res) => {
    try {
        const credits = await tmdb.getMovieCredits(req.params.id);
        res.json({ status: true, developers: Developers, ...credits });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Series Credits
app.get("/series/:id/credits", async (req, res) => {
    try {
        const credits = await tmdb.getSeriesCredits(req.params.id);
        res.json({ status: true, developers: Developers, ...credits });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Similar Movies
app.get("/movies/:id/similar", async (req, res) => {
    try {
        const data = await tmdb.getSimilarMovies(req.params.id);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Movie Recommendations
app.get("/movies/:id/recommendations", async (req, res) => {
    try {
        const data = await tmdb.getMovieRecommendations(req.params.id);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Similar Series
app.get("/series/:id/similar", async (req, res) => {
    try {
        const data = await tmdb.getSimilarSeries(req.params.id);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Series Recommendations
app.get("/series/:id/recommendations", async (req, res) => {
    try {
        const data = await tmdb.getSeriesRecommendations(req.params.id);
        res.json({ status: true, developers: Developers, ...data });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Person Details
app.get("/person/:id", async (req, res) => {
    try {
        const person = await tmdb.getPersonDetails(req.params.id);
        res.json({ status: true, developers: Developers, result: person });
    } catch (err) {
        res.status(500).json({ status: false, developers: Developers, message: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`🎬 Using TMDB API`);
});

