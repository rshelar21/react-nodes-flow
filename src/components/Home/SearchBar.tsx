import { Search, Trash2 } from "lucide-react";

interface SearchBarProps {
  searchPath: string;
  setSearchPath: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  searchMessage: string;
  handleClearSearch: () => void;
}

export const SearchBar = ({
  searchPath,
  setSearchPath,
  handleSearch,
  searchMessage,
  handleClearSearch,
}: SearchBarProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-200">
        Search by JSON path
      </label>
      <div className="flex gap-2 flex-col">
        <input
          type="text"
          value={searchPath}
          onChange={(e) => setSearchPath(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="$.user.address.city or user.address.city"
          className="flex-1 px-4 py-2 rounded-lg border bg-gray-800 text-gray-100 border-gray-700"
        />
        <div className="flex items-center gap-2">
          <button
            disabled={!searchPath}
            onClick={handleClearSearch}
            className="w-full flex items-center justify-center px-6 py-2 hover:bg-red-600 text-white rounded-lg transition font-medium bg-red-500 gap-2 disabled:border-gray-100 disabled:cursor-not-allowed"
          >
            Clear Search
            <Trash2 className="size-5" />
          </button>
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium gap-2"
          >
            Search
            <Search className="size-5" />
          </button>
        </div>
      </div>
      {searchMessage && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm font-medium ${
            searchMessage.includes("✓")
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-yellow-100 text-yellow-700 border border-yellow-400"
          }`}
        >
          {searchMessage}
        </div>
      )}
    </div>
  );
};
