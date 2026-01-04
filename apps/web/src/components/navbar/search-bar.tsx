"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?location=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center bg-accent rounded-control">
        <div className="flex-1 flex items-center px-4">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for parking..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-transparent placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>
    </form>
  );
}
