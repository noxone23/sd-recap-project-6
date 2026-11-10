import { Search } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="search-field">
      <label htmlFor="search">Search</label>
      <Search aria-hidden="true" />
      <input
        id="search"
        type="search"
        placeholder="Search by title or artist"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
