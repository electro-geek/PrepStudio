"use client";

import { useEffect, useId, useRef, useState } from "react";

let _initialized = false;

/**
 * Renders a Mermaid diagram definition as inline SVG.
 * Gemini occasionally emits invalid Mermaid, so render is wrapped in try/catch
 * and falls back to showing the raw definition — the page never crashes.
 */
export default function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // useId returns a string with ':' which is invalid in a DOM/SVG id — strip it.
  const rawId = useId();
  const id = `mmd-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!chart || !chart.trim()) return;
      try {
        const mermaid = (await import("mermaid")).default;
        if (!_initialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "strict",
            fontFamily: "inherit",
          });
          _initialized = true;
        }
        const { svg } = await mermaid.render(id, chart.trim());
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setFailed(false);
        }
      } catch (e) {
        console.error("Mermaid render failed:", e);
        if (!cancelled) setFailed(true);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="term-surface p-4 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap">
        {chart}
      </pre>
    );
  }

  return <div ref={ref} className="mermaid-wrap overflow-x-auto flex justify-center" />;
}
