const API_KEY = "b8590831ab8bbcc35dea95a8d069f54e";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

const movieGrid = document.getElementById("movieGrid");
const watchlistGrid = document.getElementById("watchlistGrid");
const watchlistSection = document.getElementById("watchlistSection");
const movieSection = document.getElementById("movie-section");
const watchlistBtn = document.getElementById("watchlistBtn");
const searchInput = document.getElementById("searchInput");
const trailerModal = document.getElementById("trailerModal");
const trailerFrame = document.getElementById("trailerFrame");
const closeTrailerBtn = document.getElementById("closeTrailer");
const themeToggle = document.getElementById("themeToggle");

// Card renderer
function renderCard(media, showSection) {
  const card = document.createElement("div");
  card.className = "card";

  const poster = media.poster_path ? IMG + media.poster_path : "fallback.jpg";
  const inList = watchlist.some((m) => m.id === media.id);

  card.innerHTML = `
    <img src="${poster}" alt="${media.title || media.name}" />
    <h4>${media.title || media.name}</h4>
    <button class="trailer-btn">▶ Trailer</button>
    <button class="watch-btn">${inList ? "❌ Remove" : "➕ Watchlist"}</button>
  `;

  card.querySelector(".trailer-btn").onclick = () => playTrailer(media);
  card.querySelector(".watch-btn").onclick = () => {
    toggleWatchlist(media);
    card.querySelector(".watch-btn").textContent = watchlist.some(
      (m) => m.id === media.id
    )
      ? "❌ Remove"
      : "➕ Watchlist";
    if (showSection) loadWatchlist();
  };
  return card;
}

// Display sections
function displayMovies(list) {
  movieGrid.innerHTML = "";
  movieSection.classList.remove("hidden");
  watchlistSection.classList.add("hidden");
  list.forEach((m) => movieGrid.appendChild(renderCard(m, false)));
}

function loadWatchlist() {
  watchlistGrid.innerHTML = "";
  movieSection.classList.add("hidden");
  watchlistSection.classList.remove("hidden");

  if (!watchlist.length) {
    watchlistGrid.innerHTML = "<p>No movies in your Watchlist.</p>";
    return;
  }
  watchlist.forEach((m) => watchlistGrid.appendChild(renderCard(m, true)));
}

// Fetchers
function getTrending() {
  fetch(`${BASE}/trending/all/day?api_key=${API_KEY}`)
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
}
function getTopRated() {
  fetch(`${BASE}/movie/top_rated?api_key=${API_KEY}`)
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
}
function getUpcoming() {
  fetch(`${BASE}/movie/upcoming?api_key=${API_KEY}`)
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
}
function filterGenre(name) {
  const ids = { Animation: 16, Family: 10751, Documentary: 99 };
  fetch(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${ids[name]}`)
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
}
function filterByGenreDropdown() {
  const id = document.getElementById("genreSelect").value;
  if (!id) return;
  fetch(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${id}`)
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
}

// Search
searchInput.oninput = () => {
  const q = searchInput.value.trim();
  if (q.length < 2) return;
  fetch(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`
  )
    .then((r) => r.json())
    .then((d) => displayMovies(d.results));
};

// Watchlist and persistent state
function toggleWatchlist(media) {
  const idx = watchlist.findIndex((m) => m.id === media.id);
  if (idx > -1) watchlist.splice(idx, 1);
  else watchlist.push(media);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// Trailer logic (updated for showType)
function playTrailer(media) {
  const type = media.title ? "movie" : "tv";
  fetch(`${BASE}/${type}/${media.id}/videos?api_key=${API_KEY}`)
    .then((r) => r.json())
    .then((d) => {
      const t = d.results.find((v) => v.type === "Trailer");
      if (t) {
        trailerFrame.src = `https://www.youtube.com/embed/${t.key}?autoplay=1`;
        trailerModal.style.display = "flex";
      } else alert("Trailer not available");
    });
}

// Event setup
watchlistBtn.onclick = loadWatchlist;
closeTrailerBtn.onclick = () => {
  trailerModal.style.display = "none";
  trailerFrame.src = "";
};
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light"
  );
};

// Init
window.onload = () => {
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-theme");
  getTrending();
  fetch(`${BASE}/genre/movie/list?api_key=${API_KEY}`)
    .then((r) => r.json())
    .then((d) => {
      const sel = document.getElementById("genreSelect");
      d.genres.forEach((g) => {
        sel.add(new Option(g.name, g.id));
      });
    });
};
