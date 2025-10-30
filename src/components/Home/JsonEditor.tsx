import { Trash2 } from "lucide-react";
import { CopyToClipboard } from "../common/CopyToClipboard";

interface JsonEditorProps {
  jsonInput: string;
  setJsonInput: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  handleGenerateTree: () => void;
  handleClearJson: () => void;
}

export const JsonEditor = ({
  jsonInput,
  setJsonInput,
  error,
  handleGenerateTree,
  handleClearJson,
}: JsonEditorProps) => {
  return (
    <div>
      <div className="relative">
        <div className="absolute top-10 right-8 z-10">
          <CopyToClipboard text={jsonInput} />
        </div>
        <label className="block text-md font-medium mb-2 text-gray-200">
          Paste or type JSON data
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-64 p-4 rounded-lg border font-mono text-sm bg-gray-800 text-gray-100 border-gray-700"
          placeholder="Enter JSON here..."
        />
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleClearJson}
            className="w-full flex items-center justify-center px-6 py-2 hover:bg-red-600 text-white rounded-lg transition font-medium bg-red-500 gap-2 disabled:border-gray-100 disabled:cursor-not-allowed"
          >
            Clear Tree
            <Trash2 className="size-5" />
          </button>
          <button
            onClick={handleGenerateTree}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Generate Tree
          </button>
        </div>
      </div>
    </div>
  );
};
