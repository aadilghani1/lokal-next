"use client";

import type { ReactNode } from "react";

interface ToolUIProps {
  name: string;
  input: Record<string, unknown>;
  output_preview: string;
}

type ToolRenderer = (props: ToolUIProps) => ReactNode;

function KeywordSerpUI({ input, output_preview }: ToolUIProps) {
  const keyword = String(input.keyword ?? "");
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">serp</span>
        <span className="text-[10px] text-muted-foreground/60">via Google</span>
      </div>
      <div className="px-4 py-3">
        <p className="font-heading text-[15px] font-semibold tracking-tight">{keyword}</p>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono leading-relaxed line-clamp-2">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function KeywordResearchUI({ input, output_preview }: ToolUIProps) {
  const keywords = (input.keywords as string[]) ?? [];
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">keywords</span>
        <span className="text-[10px] text-muted-foreground/60">via DataForSEO</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {keywords.slice(0, 6).map((kw) => (
            <span key={kw} className="inline-block border border-border/50 rounded px-2 py-0.5 text-[11px] font-mono">{kw}</span>
          ))}
          {keywords.length > 6 && (
            <span className="text-[11px] text-muted-foreground/50 self-center">+{keywords.length - 6}</span>
          )}
        </div>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono leading-relaxed line-clamp-2">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function TavilySearchUI({ input, output_preview }: ToolUIProps) {
  const query = String(input.query ?? "");
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">search</span>
        <span className="text-[10px] text-muted-foreground/60">via Tavily</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm italic text-foreground/80">&ldquo;{query}&rdquo;</p>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono leading-relaxed line-clamp-2">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function DefaultToolUI({ name, input, output_preview }: ToolUIProps) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40">
        <code className="font-mono text-[11px] tracking-wide">{name}</code>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-muted-foreground/70 font-mono leading-relaxed line-clamp-2">
          {JSON.stringify(input).slice(0, 150)}
        </p>
      </div>
    </div>
  );
}

const TOOL_REGISTRY: Record<string, ToolRenderer> = {
  keyword_serp: KeywordSerpUI,
  keyword_research: KeywordResearchUI,
  tavily_search: TavilySearchUI,
};

export function ToolUI(props: ToolUIProps) {
  const Renderer = TOOL_REGISTRY[props.name] ?? DefaultToolUI;
  return <Renderer {...props} />;
}
