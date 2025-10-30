import { Panel } from "@xyflow/react";
import { toPng } from "html-to-image";

export const DownloadChartButton = () => {
  const handleDownloadImage = () => {
    const flow = document.querySelector(".react-flow"); // React Flow container
    if (!flow || !(flow instanceof HTMLElement)) {
      alert("React Flow container not found!");
      return;
    }

    // optional: temporarily disable controls for cleaner image
    const controls = flow.querySelector(
      ".react-flow__controls"
    ) as HTMLElement | null;
    if (controls) controls.style.display = "none";

    toPng(flow, { backgroundColor: "#1e293b" }) // same bg as your app
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "nodes-chart.png";
        link.href = dataUrl;
        link.click();

        // restore controls
        if (controls) controls.style.display = "flex";
      })
      .catch((err) => {
        console.error("Error exporting React Flow:", err);
        alert("Failed to export image");
      });
  };
  return (
    <Panel position="top-right">
      <button
        className="border bg-pink-400 py-2 rounded-full px-4 "
        onClick={handleDownloadImage}
      >
        Download Image
      </button>
    </Panel>
  );
};
