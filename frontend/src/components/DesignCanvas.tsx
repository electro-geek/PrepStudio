"use client";

import { Tldraw, getSnapshot, loadSnapshot, type Editor } from "tldraw";
import "tldraw/tldraw.css";

export interface ExportedCanvas {
  document: any;
  image: string | null;
}

/**
 * Rasterize the current page to a PNG data URL and grab the re-editable
 * document snapshot. Used by the parent on "Evaluate".
 */
export async function exportCanvas(editor: Editor): Promise<ExportedCanvas> {
  const { document } = getSnapshot(editor.store);

  if (editor.getCurrentPageShapeIds().size === 0) {
    return { document, image: null };
  }

  try {
    const res = await editor.toImage([], {
      format: "png",
      background: true,
      pixelRatio: 2,
    });
    if (!res?.blob) return { document, image: null };
    const image = await blobToDataUrl(res.blob);
    return { document, image };
  } catch (e) {
    console.error("Canvas export failed:", e);
    return { document, image: null };
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function DesignCanvas({
  initialScene,
  onEditor,
}: {
  initialScene?: any;
  onEditor: (editor: Editor) => void;
}) {
  return (
    <div className="h-[460px] rounded-lg overflow-hidden border border-border relative">
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE}
        onMount={(editor) => {
          if (initialScene) {
            try {
              loadSnapshot(editor.store, { document: initialScene });
            } catch (e) {
              console.error("Failed to restore canvas:", e);
            }
          }
          onEditor(editor);
        }}
      />
    </div>
  );
}
