import { useEffect, useState } from "react";
import StarRating from "./components/StarRating";
// const tempMovieData = [
// 	{
// 		imdbID: "tt1375666",
// 		Title: "Inception",
// 		Year: "2010",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
// 	},
// 	{
// 		imdbID: "tt0133093",
// 		Title: "The Matrix",
// 		Year: "1999",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
// 	},
// 	{
// 		imdbID: "tt6751668",
// 		Title: "Parasite",
// 		Year: "2019",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
// 	},
// ];

// const tempWatchedData = [
// 	{
// 		imdbID: "tt1375666",
// 		Title: "Inception",
// 		Year: "2010",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
// 		runtime: 148,
// 		imdbRating: 8.8,
// 		userRating: 10,
// 	},
// 	{
// 		imdbID: "tt0088763",
// 		Title: "Back to the Future",
// 		Year: "1985",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
// 		runtime: 116,
// 		imdbRating: 8.5,
// 		userRating: 9,
// 	},
// ];

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// App component | Structural Component
const key = "b2fe8230";
export default function App() {
	const [selectedId, setSelectedId] = useState(null);
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	// following is the function of browser api, allowing to cancel the previous request when the next one is triggered;
	const controller = new AbortController();
	function handleSelectMovie(id) {
		// if the selected movie is clicked twice, it will be unselected
		setSelectedId((selectedId) => (id === selectedId ? null : id));
	}
	function handleDeleteWatchedMovie(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}
	function handleWatchedMovie(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	useEffect(
		function () {
			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError("");
					const res = await fetch(
						`http://www.omdbapi.com/?apikey=${key}&s=${query}`,
						{ signal: controller.signal }
					);
					if (!res.ok)
						// sends error when response is not ok and that error is catched in catch block
						throw new Error("Something went wrong with fetching movies");
					const data = await res.json();
					if (data.Response === "False") throw new Error("Movie not found");
					setMovies(data.Search);
					setError("");
					setIsLoading(false);
				} catch (err) {
					if (err.name !== "AbortError") setError(err.message);
				} finally {
					setIsLoading(false);
				}
			}
			if (query.length < 3) {
				setMovies([]);
				setError("");
				return;
			}
			handleCloseMovie();
			fetchMovies();
			// clean up function to prevent race conditions firing multiple requests that consumes resources
			return function () {
				controller.abort();
			};
		},
		[query]
	);
	return (
		<>
			<NavBar>
				{/* here component composition is being performed to avoid prop drilling.... */}
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResult movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{/* here we are passing component as children that needs movie props */}
					{/* following are three mutually exlclusive conditions; only one of them would be true */}
					{isLoading && <Loader />}
					{error && <ErrorMessage message={error} />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddToWatched={handleWatchedMovie}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatchedMovie}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
function ErrorMessage({ message }) {
	return (
		<>
			<div className="error">
				<span role="img">⛔</span>
				<p>{message}</p>
			</div>
		</>
	);
}
function Loader() {
	return <p className="loader">Loading....</p>;
}
// navbar component | Structural Component

function NavBar({ children }) {
	return (
		<>
			{/* here children are accepted in the structural component to avoid prop drilling */}
			<nav className="nav-bar">{children}</nav>
		</>
	);
}
// NumResult Component | Presentational Component
function NumResult({ movies }) {
	return (
		<>
			<p className="num-results">
				Found <strong>{movies.length}</strong> results
			</p>
		</>
	);
}
// Logo Component | Presentational Component
function Logo() {
	return (
		<>
			<div className="logo">
				<span role="img">🍿</span>
				<h1>usePopcorn</h1>
			</div>
		</>
	);
}
// Search component | stateful Componet
function Search({ query, setQuery }) {
	return (
		<>
			<input
				className="search"
				type="text"
				placeholder="Search movies..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
		</>
	);
}
// Main component | Layout or Structural Component
function Main({ children }) {
	return (
		<>
			{/* here children are being accepted in structural component to avoid prop drilling */}
			<main className="main">{children}</main>
		</>
	);
}
// left box component | Stateful Component
// This box component is reusable; whatever is passed in children is rendered; always strive to make such components to create UI and prevent prop drilling issue.
function Box({ children }) {
	const [isOpen, setIsOpen1] = useState(true);

	return (
		<>
			<div className="box">
				<button
					className="btn-toggle"
					onClick={() => setIsOpen1((open) => !open)}>
					{isOpen ? "–" : "+"}
				</button>
				{isOpen && children}
			</div>
		</>
	);
}
// right box component | stateful component
// function WatchedBox() {
// 	const [isOpen2, setIsOpen2] = useState(true);
// 	const [watched, setWatched] = useState(tempWatchedData);

// 	return (
// 		<>
// 			<div className="box">
// 				<button
// 					className="btn-toggle"
// 					onClick={() => setIsOpen2((open) => !open)}>
// 					{isOpen2 ? "–" : "+"}
// 				</button>
// 				{isOpen2 && (
// 					<>
// 						<WatchedSummary watched={watched} />
// 						<WatchedMoviesList watched={watched} />
// 					</>
// 				)}
// 			</div>
// 		</>
// 	);
// }
// MovieList component | Stateful component
function MovieList({ movies, onSelectMovie }) {
	return (
		<>
			<ul className="list list-movies">
				{movies?.map((movie) => (
					<Movie
						movie={movie}
						key={movie.imdbID}
						onSelectMovie={onSelectMovie}
					/>
				))}
			</ul>
		</>
	);
}
// movieList componet | presentational component
function Movie({ movie, onSelectMovie }) {
	return (
		<>
			<li onClick={() => onSelectMovie(movie.imdbID)}>
				<img src={movie.Poster} alt={`${movie.Title} poster`} />
				<h3>{movie.Title}</h3>
				<div>
					<p>
						<span>🗓</span>
						<span>{movie.Year}</span>
					</p>
				</div>
			</li>
		</>
	);
}

// WatchedSummary component | Presentational component
function MovieDetails({ selectedId, onCloseMovie, onAddToWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");
	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	// finding the user rating of the selected movie
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	function handleAddMovie() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating: Number(userRating),
		};

		onAddToWatched(newWatchedMovie);
		onCloseMovie();
	}
	// here we want to destructure the object coming from api to better fit here
	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;
	// we want to show the movie details only when the movie is selected. we will use useEffect to bring data when component mounts.
	useEffect(() => {
		async function getMovieDetails() {
			setIsLoading(true);
			const res = await fetch(
				`http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
			);
			const data = await res.json();
			setMovie(data);
			setIsLoading(false);
		}
		getMovieDetails();
		// if we dont pass the value of selectedId in dependency arrow, the component will only mount once. if we select another movie, it would not be updated.
	}, [selectedId]);
	useEffect(() => {
		if (!title) return;
		document.title = `Movie | ${title}`;
		// clean up function runs when component unmounts; it is necessary to eradicate the side effects of the component; it also runs when the component re-renders;
		return function cleanUp() {
			document.title = "usePopcorn";
			// when component unmounts, it remeber the names of variables used in useEffect due to JS concept called closure: it will be able to access the variables even when the component unmounts
			console.log(`clean up ${title}`);
		};
	}, [title]);
	useEffect(
		function () {
			function callback(e) {
				if (e.key === "Escape") onCloseMovie();
			}
			document.addEventListener("keydown", callback);
			return function cleanUp() {
				document.removeEventListener("keydown", callback);
			};
		},
		[onCloseMovie]
	);
	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<button className="btn-back" onClick={onCloseMovie}>
						&larr;
					</button>
					<img src={poster} alt={`${title}`} />
					<div className="details-overview">
						<h2>{title}</h2>
						<p>
							{released} &bull; {runtime}
						</p>
						<p>Released Year: {year}</p>
						<p>{genre}</p>
						<p>
							<span>⭐</span>
							{imdbRating} IMDb rating
						</p>
						{userRating > 0 && (
							<button className="btn-add" onClick={handleAddMovie}>
								Add to List
							</button>
						)}
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
								</>
							) : (
								<p>You rated this movie {watchedUserRating} ⭐</p>
							)}
						</div>
						<section>
							<p>
								<em>{plot}</em>
							</p>
							<p>Starring {actors}</p>
							<p>Directed by {director}</p>
						</section>
					</div>
				</>
			)}
		</div>
	);
}
function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));
	const avgUserRating = average(watched.map((movie) => movie.userRating));

	return (
		<>
			<div className="summary">
				<h2>Movies you watched</h2>
				<div>
					<p>
						<span>#️⃣</span>
						<span>{watched.length} movies</span>
					</p>
					<p>
						<span>⭐️</span>
						<span>{avgImdbRating.toFixed(2)}</span>
					</p>
					<p>
						<span>🌟</span>
						<span>{avgUserRating.toFixed(2)}</span>
					</p>
					<p>
						<span>⏳</span>
						<span>{avgRuntime} min</span>
					</p>
				</div>
			</div>
		</>
	);
}
//WatchedMovieList | presentational component
function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<>
			<ul className="list">
				{watched.map((movie) => (
					<WatchedMovie
						movie={movie}
						key={movie.imdbID}
						onDeleteWatched={onDeleteWatched}
					/>
				))}
			</ul>
		</>
	);
}
// WatchedMoive component | presentational component
function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<>
			<li>
				<img src={movie.poster} alt={`${movie.title} poster`} />
				<h3>{movie.title}</h3>
				<div>
					<p>
						<span>⭐️</span>
						<span>{movie.imdbRating}</span>
					</p>
					<p>
						<span>🌟</span>
						<span>{movie.userRating}</span>
					</p>
					<p>
						<span>⏳</span>
						<span>{movie.runtime} min</span>
					</p>
					<button
						className="btn-delete"
						onClick={() => onDeleteWatched(movie.imdbID)}>
						X
					</button>
				</div>
			</li>
		</>
	);
}
