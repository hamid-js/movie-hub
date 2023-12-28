export default function WatchedItem({ movie, onDelete }) {
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
