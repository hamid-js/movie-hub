/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "1d233f7f";

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  const [query, setQuery] = useState("");

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return  JSON.parse(storedValue)
  });

  function selectMovieHandler(id) {  

    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function closeMovieHandler() {
    setSelectedId(null);
  }

  function addWatchedHandler(movie) {
    setWatched((watched) => [...watched, movie]);
   
  }

  function deleteMovieHandler(id) {
    setWatched((watched) =>
      watched.filter((movie) => {
        return movie.imdbId !== id;
      })
    );
  }

  useEffect(function () {
    localStorage.setItem("watched" ,JSON.stringify(watched))
  },[watched])

  useEffect(function () {
    function keypressHandler(e) {
      if (document.title !== "Movie Hub")
        if (e.keyCode === 27) {
          closeMovieHandler();
        }
    }
    document.addEventListener("keydown", keypressHandler);

    return function () {
      document.removeEventListener("keypress", keypressHandler);
    };
  }, []);

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("something went wrong");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
            setMovies([]);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      closeMovieHandler();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <ListBox>
          <Button isOpen={isOpen} setIsOpen={setIsOpen} />
          {isLoading && <Loader />}
          {isOpen && !isLoading && !error && (
            <MoviesList>
              {movies?.map((movie) => (
                <MoviesItem onSelect={selectMovieHandler} movie={movie} key={movie.imdbID} />
              ))}
            </MoviesList>
          )}
          {error && <ErrorMessage message={error} />}
          { !movies.length && <p className="list-empty"> Start searching for your favorite movie...😍</p>}
        </ListBox>

        <ListBox>
          <Button isOpen={isOpen2} setIsOpen={setIsOpen2} />
          {isOpen2 && (
            <>
              {selectedId ? (
                <MovieDetails
                  selectedId={selectedId}
                  onCloseMovie={closeMovieHandler}
                  onAddWatched={addWatchedHandler}
                  watched={watched}
                />
              ) : (
                <>
                  <WatchedSummary watched={watched} />
                  <WatchedList watched={watched} onDelete={deleteMovieHandler} />
                </>
              )}
            </>
          )}
        </ListBox>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🎦</span>
      <h1>my movie</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ children }) {
  return <div className="box">{children}</div>;
}

function MoviesList({ children }) {
  return <ul className="list list-movies">{children}</ul>;
}
function MoviesItem({ movie, onSelect }) {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Button({ isOpen, setIsOpen }) {
  return (
    <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  //STSTES
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // Checking watch list
  const isInWatch = watched.some((watach) => {
    if (watach.imdbId === selectedId) return true;
  });

  //detecte user rating
  const watachUserRating = watched.find((movie) => movie.imdbId === selectedId)?.userRating;

  // DESTRUCTURE & RENAME DATAS
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
  } = movieDetails;

  // ADDING MOVIE TO WATCH LIST
  function handleAdd() {
    const newWatchMovie = {
      imdbId: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
    };

    onAddWatched(newWatchMovie);
    onCloseMovie();
  }

  //FETCHING BY useEffect
  useEffect(
    function () {
      async function fetchMoviesDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
          if (!res.ok) throw new Error("MovieDetails cant fetch");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovieDetails(data);
        } catch (arr) {
          alert("Error: ", arr);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMoviesDetails();
    },
    [selectedId]
  );

  //Change Page Title BY useEffect
  useEffect(
    function () {
      if (!title || !year) return;
      document.title = `Movie | ${title} | ${year}`;
      return function () {
        document.title = " Movie Hub";
      };
    },
    [title, year]
  );

  // JSX
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button onClick={onCloseMovie} className="btn-back">
              &larr;
            </button>

            <>
              <img src={poster} alt="" />
              <div className="details-overview">
                <h2>{title}</h2>

                <p>
                  {released} &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>⭐</span>
                  {imdbRating}
                </p>
                <p>{year}</p>

                <p>{runtime}</p>
              </div>
            </>
          </header>
          <section>
            <div className="rating">
              {!isInWatch ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button onClick={handleAdd} className="btn-add">
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  {" "}
                  This Movie Exsist in your Watch list : {watachUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Staring : by {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{isNaN(avgImdbRating) ? "Unrated" : avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{isNaN(avgUserRating) ? "Unrated" : avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedItem onDelete={onDelete} movie={movie} key={movie.imdbId} />
      ))}
    </ul>
  );
}

function WatchedItem({ movie, onDelete }) {
  const { poster, title, imdbRating, userRating, runtime } = movie;
  return (
    <li>
      <img src={poster} alt={`${title} poster`} />
      <h3>{title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{isNaN(imdbRating) ? "Unrated" : imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{runtime} min</span>
        </p>
        <button onClick={() => onDelete(movie.imdbId)} className="btn-delete">
          X
        </button>
      </div>
    </li>
  );
}

function Loader() {
  return <p className="loader">loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
