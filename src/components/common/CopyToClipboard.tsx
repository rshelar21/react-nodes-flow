import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";

export const CopyToClipboard = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <div className="bg-gray-900 p-2 rounded-lg">
      <button onClick={handleCopy}>
        {isCopied ? (
          <ClipboardCheck className="size-4 text-green-700" />
        ) : (
          <Clipboard className="size-4 text-white" />
        )}
      </button>
    </div>
  );
};
