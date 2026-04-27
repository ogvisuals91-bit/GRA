import { useCallback, useState } from "react";
import html2canvas from "html2canvas";

export function useDownloadImage() {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#0a0014",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }, []);

  return { download, downloading };
}
