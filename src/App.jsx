/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Navbar from "./feature/Navbar";
import NumResults from "./feature/NumResults";
import Logo  from "./feature/Logo";
import Search  from "./feature/Search";
import Main  from "./feature/Main";
import ListBox  from "./feature/ListBox";
import MoviesList  from "./feature/MoviesList";
import MoviesItem  from "./feature/MoviesItem";
import Button  from "./feature/Button";
import MovieDetails  from "./feature/MovieDetails";
import WatchedSummary  from "./feature/WatchedSummary";
import WatchedList  from "./feature/WatchedList";
import ErrorMessage  from "./feature/ErrorMessage";
import Loader  from "./feature/Loader";

export const average = (arr) => arr?.reduce((acc, cur, i, arr) => acc + cur / arr?.length, 0);

export const KEY = "1d233f7f";

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
    return JSON.parse(storedValue);
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

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

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
            console.log(err?.message);
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
          {!movies.length && <p className="list-empty"> Start searching for your favorite movie...😍</p>}
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
