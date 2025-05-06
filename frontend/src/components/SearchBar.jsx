import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react'; // Optional: Lucide icons

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/posts/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex items-center w-full max-w-xl mx-auto bg-gray-100  rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-gray-200 transition"
        >
            {/* Search icon */}
            <Search className="w-5 h-5  text-black mr-2" />

            {/* Input field */}
            <input
                type="text"
                placeholder="Search posts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent outline-none text-sm text-black placeholder-gray-500 dark:placeholder-gray-400"
            />

            {/* Submit button (optional hidden) */}
            <button type="submit" className="hidden">Search</button>
        </form>
    );
};

export default SearchBar;