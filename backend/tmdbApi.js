const axios = require("axios");
require("dotenv").config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = process.env.TMDB_IMAGE_URL || "https://image.tmdb.org/t/p/w500";

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
        language: "id-ID" // Indonesian language
    },
    timeout: 15000
});

// Helper function to format movie data
const formatMovie = (movie) => ({
    id: movie.id,
    slug: movie.id.toString(),
    title: movie.title || movie.name,
    images: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : null,
    poster: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : null,
    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_URL}${movie.backdrop_path}` : null,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
    year: movie.release_date ? movie.release_date.split("-")[0] : (movie.first_air_date ? movie.first_air_date.split("-")[0] : "N/A"),
    synopsis: movie.overview || "No synopsis available",
    quality: "HD",
    genres: movie.genre_ids || []
});

// Helper function to format series data
const formatSeries = (series) => ({
    id: series.id,
    slug: series.id.toString(),
    title: series.name || series.original_name,
    images: series.poster_path ? `${TMDB_IMAGE_URL}${series.poster_path}` : null,
    poster: series.poster_path ? `${TMDB_IMAGE_URL}${series.poster_path}` : null,
    backdrop: series.backdrop_path ? `${TMDB_IMAGE_URL}${series.backdrop_path}` : null,
    rating: series.vote_average ? series.vote_average.toFixed(1) : "N/A",
    year: series.first_air_date ? series.first_air_date.split("-")[0] : "N/A",
    synopsis: series.overview || "No synopsis available",
    quality: "HD",
    genres: series.genre_ids || []
});

// Movies API
async function getPopularMovies(page = 1) {
    const response = await tmdbApi.get("/movie/popular", { params: { page } });
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

async function getLatestMovies(page = 1) {
    const response = await tmdbApi.get("/movie/now_playing", { params: { page } });
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

async function getTopRatedMovies(page = 1) {
    const response = await tmdbApi.get("/movie/top_rated", { params: { page } });
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

async function getMovieDetails(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: { append_to_response: "videos,credits" }
    });
    const movie = response.data;
    return {
        id: movie.id,
        slug: movie.id.toString(),
        title: movie.title,
        image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `${TMDB_IMAGE_URL}${movie.backdrop_path}` : null,
        quality: "HD",
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
        country: movie.production_countries?.map(c => c.name).join(", ") || "N/A",
        genres: movie.genres?.map(g => g.name).join(", ") || "N/A",
        synopsis: movie.overview || "No synopsis available",
        diterbitkan: movie.release_date || "N/A",
        duration: movie.runtime ? `${movie.runtime} min` : "N/A",
        stream: movie.videos?.results?.filter(v => v.type === "Trailer").map(v => ({
            text: v.name,
            href: `https://www.youtube.com/watch?v=${v.key}`
        })) || []
    };
}

async function searchMovies(query) {
    const response = await tmdbApi.get("/search/multi", { params: { query } });
    return response.data.results
        .filter(item => item.media_type === "movie" || item.media_type === "tv")
        .map(item => ({
            slug: item.id.toString(),
            title: item.title || item.name,
            image: item.poster_path ? `${TMDB_IMAGE_URL}${item.poster_path}` : null,
            type: item.media_type === "movie" ? "movie" : "series",
            rating: item.vote_average ? item.vote_average.toFixed(1) : "N/A",
            genres: "N/A",
            country: "N/A"
        }));
}

async function getGenres() {
    const response = await tmdbApi.get("/genre/movie/list");
    return response.data.genres.map(g => ({
        name: g.name,
        href: g.id.toString()
    }));
}

async function getMoviesByGenre(genreId, page = 1) {
    const response = await tmdbApi.get("/discover/movie", {
        params: { with_genres: genreId, page }
    });
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

// Series API
async function getPopularSeries(page = 1) {
    const response = await tmdbApi.get("/tv/popular", { params: { page } });
    return {
        total_pages: response.data.total_pages,
        series: response.data.results.map(formatSeries)
    };
}

async function getSeriesByGenre(genreId, page = 1) {
    const response = await tmdbApi.get("/discover/tv", {
        params: { with_genres: genreId, page }
    });
    return {
        total_pages: response.data.total_pages,
        series: response.data.results.map(formatSeries)
    };
}

async function getSeriesDetails(seriesId) {
    const response = await tmdbApi.get(`/tv/${seriesId}`, {
        params: { append_to_response: "videos,credits" }
    });
    const series = response.data;
    return {
        id: series.id,
        slug: series.id.toString(),
        title: series.name,
        image: series.poster_path ? `${TMDB_IMAGE_URL}${series.poster_path}` : null,
        backdrop: series.backdrop_path ? `${TMDB_IMAGE_URL}${series.backdrop_path}` : null,
        quality: "HD",
        rating: series.vote_average ? series.vote_average.toFixed(1) : "N/A",
        country: series.production_countries?.map(c => c.name).join(", ") || "N/A",
        genres: series.genres?.map(g => g.name).join(", ") || "N/A",
        synopsis: series.overview || "No synopsis available",
        diterbitkan: series.first_air_date || "N/A",
        seasons: series.number_of_seasons,
        episodes: series.number_of_episodes,
        stream: series.videos?.results?.filter(v => v.type === "Trailer").map(v => ({
            text: v.name,
            href: `https://www.youtube.com/watch?v=${v.key}`
        })) || []
    };
}

async function getSeriesGenres() {
    const response = await tmdbApi.get("/genre/tv/list");
    return response.data.genres.map(g => ({
        name: g.name,
        href: g.id.toString()
    }));
}

// ==================== NEW FEATURES ====================

// Trending Movies (daily/weekly)
async function getTrendingMovies(timeWindow = "day") {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

// Trending Series (daily/weekly)
async function getTrendingSeries(timeWindow = "day") {
    const response = await tmdbApi.get(`/trending/tv/${timeWindow}`);
    return {
        total_pages: response.data.total_pages,
        series: response.data.results.map(formatSeries)
    };
}

// Upcoming Movies
async function getUpcomingMovies(page = 1) {
    const response = await tmdbApi.get("/movie/upcoming", { params: { page } });
    return {
        total_pages: response.data.total_pages,
        movies: response.data.results.map(formatMovie)
    };
}

// Movie Credits (Cast & Crew)
async function getMovieCredits(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return {
        cast: response.data.cast.slice(0, 20).map(person => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profile: person.profile_path ? `${TMDB_IMAGE_URL}${person.profile_path}` : null,
            order: person.order
        })),
        crew: response.data.crew.filter(p => 
            p.job === "Director" || p.job === "Producer" || p.job === "Writer"
        ).map(person => ({
            id: person.id,
            name: person.name,
            job: person.job,
            profile: person.profile_path ? `${TMDB_IMAGE_URL}${person.profile_path}` : null
        }))
    };
}

// Series Credits (Cast & Crew)
async function getSeriesCredits(seriesId) {
    const response = await tmdbApi.get(`/tv/${seriesId}/credits`);
    return {
        cast: response.data.cast.slice(0, 20).map(person => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profile: person.profile_path ? `${TMDB_IMAGE_URL}${person.profile_path}` : null,
            order: person.order
        })),
        crew: response.data.crew.filter(p => 
            p.job === "Director" || p.job === "Producer" || p.job === "Writer" || p.job === "Creator"
        ).map(person => ({
            id: person.id,
            name: person.name,
            job: person.job,
            profile: person.profile_path ? `${TMDB_IMAGE_URL}${person.profile_path}` : null
        }))
    };
}

// Similar Movies
async function getSimilarMovies(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return {
        movies: response.data.results.slice(0, 12).map(formatMovie)
    };
}

// Movie Recommendations
async function getMovieRecommendations(movieId) {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`);
    return {
        movies: response.data.results.slice(0, 12).map(formatMovie)
    };
}

// Similar Series
async function getSimilarSeries(seriesId) {
    const response = await tmdbApi.get(`/tv/${seriesId}/similar`);
    return {
        series: response.data.results.slice(0, 12).map(formatSeries)
    };
}

// Series Recommendations
async function getSeriesRecommendations(seriesId) {
    const response = await tmdbApi.get(`/tv/${seriesId}/recommendations`);
    return {
        series: response.data.results.slice(0, 12).map(formatSeries)
    };
}

// Person Details
async function getPersonDetails(personId) {
    const response = await tmdbApi.get(`/person/${personId}`, {
        params: { append_to_response: "movie_credits,tv_credits" }
    });
    const person = response.data;
    return {
        id: person.id,
        name: person.name,
        biography: person.biography || "No biography available",
        birthday: person.birthday,
        deathday: person.deathday,
        place_of_birth: person.place_of_birth,
        profile: person.profile_path ? `${TMDB_IMAGE_URL}${person.profile_path}` : null,
        known_for: person.known_for_department,
        movies: person.movie_credits?.cast?.slice(0, 12).map(formatMovie) || [],
        tvShows: person.tv_credits?.cast?.slice(0, 12).map(formatSeries) || []
    };
}

// Search for movies and series
async function searchMulti(query, page = 1) {
    const response = await tmdbApi.get("/search/multi", { 
        params: { 
            query,
            page,
            include_adult: false
        } 
    });
    
    // Filter and format results (only movies and tv shows)
    const results = response.data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(item => {
            if (item.media_type === 'movie') {
                return { ...formatMovie(item), type: 'movie' };
            } else {
                return { ...formatSeries(item), type: 'series' };
            }
        });
    
    return {
        results,
        page: response.data.page,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results
    };
}

module.exports = {
    getPopularMovies,
    getLatestMovies,
    getTopRatedMovies,
    getMovieDetails,
    getMovieGenres: getGenres, // Renamed getGenres to getMovieGenres as per instruction's exports
    getMoviesByGenre,
    getPopularSeries,
    getSeriesDetails,
    getSeriesGenres,
    getSeriesByGenre,
    // New features
    getTrendingMovies,
    getTrendingSeries,
    getUpcomingMovies,
    getMovieCredits,
    getSeriesCredits,
    getSimilarMovies,
    getMovieRecommendations,
    getSimilarSeries,
    getSeriesRecommendations,
    getPersonDetails,
    // Search
    searchMulti
};
