import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search posts..."
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<number | null>(null);  // 👈 Cambiado aquí

  // Limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Limpiar timeout previo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout para debounce
    timeoutRef.current = window.setTimeout(() => {  // 👈 Agregado window.
      onSearch(value);
    }, 300);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleSearch}
        className="w-full px-4 py-3 pl-10 bg-[#1B1B1F] text-white border border-gray-700 rounded-full focus:outline-none focus:border-[#FFC267] transition"
      />
      <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
          aria-label="Clear search"
        >
          <i className="bx bx-x text-xl"></i>
        </button>
      )}
    </div>
  );
}