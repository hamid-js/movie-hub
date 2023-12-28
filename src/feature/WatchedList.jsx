import  WatchedItem  from "./WatchedItem";

export default function WatchedList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedItem onDelete={onDelete} movie={movie} key={movie.imdbId} />
      ))}
    </ul>
  );
}
