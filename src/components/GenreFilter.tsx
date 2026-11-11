interface GenreFilterProps {
  genres: string[];
  value: string;
  onChange: (genre: string) => void;
}

export default function GenreFilter({
  genres,
  value,
  onChange,
}: GenreFilterProps) {
  return (
    <div className="genre-filter">
      <label htmlFor="genre">Genre</label>
      <select
        id="genre"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
}
