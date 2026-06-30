"use client";

import { useEffect, useId, useRef, useState } from "react";

let _initialized = false;

/**
 * Renders a Mermaid diagram definition as inline SVG.
 * Gemini occasionally emits invalid Mermaid, so we validate with mermaid.parse()
 * first and disable Mermaid's own error graphic — on failure we fall back to
 * showing the raw definition instead of Mermaid's "bomb" error SVG.
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
      const def = (chart || "").trim();
      if (!def) return;
      try {
        const mermaid = (await import("mermaid")).default;
        if (!_initialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "strict",
            fontFamily: "inherit",
            // Never let Mermaid inject its own error ("bomb") SVG into the page.
            suppressErrorRendering: true,
          });
          _initialized = true;
        }

        // Validate first — suppressErrors makes this return false instead of
        // throwing, so a bad definition never reaches render().
        const valid = await mermaid.parse(def, { suppressErrors: true });
        if (!valid) {
          if (!cancelled) setFailed(true);
          return;
        }

        const { svg } = await mermaid.render(id, def);
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
      <div className="space-y-2">
        <p className="section-label text-muted">Diagram couldn&apos;t render — showing definition</p>
        <pre className="term-surface p-4 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return <div ref={ref} className="mermaid-wrap overflow-x-auto flex justify-center" />;
}
