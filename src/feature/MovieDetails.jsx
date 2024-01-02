import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { KEY } from "../App";
import  Loader  from "./Loader";

export default function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  //STSTES
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // Checking watch list
  const isInWatch = watched?.some((watach) => {
    if (watach.imdbId === selectedId) return true;
  });

  //detecte user rating
  const watachUserRating = watched?.find((movie) => movie.imdbId === selectedId)?.userRating;

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
          const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
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
