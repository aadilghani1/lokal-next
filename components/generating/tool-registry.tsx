"use client";

import type { ReactNode } from "react";

interface ToolUIProps {
  name: string;
  input: Record<string, unknown>;
  output_preview: string;
}

type ToolRenderer = (props: ToolUIProps) => ReactNode;

function parseSerpResults(preview: string): { rank: number; title: string; domain: string }[] {
  try {
    const parsed = JSON.parse(preview);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 4).map((r) => ({
        rank: r.rank ?? 0,
        title: (r.title ?? "").slice(0, 60),
        domain: r.domain ?? "",
      }));
    }
  } catch {}
  return [];
}

function parseKeywordResults(preview: string): { keyword: string; volume: number }[] {
  try {
    const parsed = JSON.parse(preview);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 5).map((r) => ({
        keyword: r.keyword ?? "",
        volume: r.search_volume ?? 0,
      }));
    }
  } catch {}
  return [];
}

function parseSearchResults(preview: string): { title: string; url: string }[] {
  try {
    const parsed = JSON.parse(preview);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).map((r) => ({
        title: (r.title ?? "").slice(0, 50),
        url: r.url ?? "",
      }));
    }
  } catch {}
  return [];
}

function KeywordSerpUI({ input, output_preview }: ToolUIProps) {
  const keyword = String(input.keyword ?? "");
  const results = parseSerpResults(output_preview);

  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      {/* Search bar mimicking Google */}
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/30">
        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-3 py-1">
          <svg className="size-3 text-muted-foreground/40" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="text-[13px]">{keyword}</span>
        </div>
      </div>
      {/* SERP results */}
      {results.length > 0 ? (
        <div className="divide-y divide-border/20">
          {results.map((r, i) => (
            <div key={i} className="px-4 py-2">
              <p className="text-[10px] font-mono text-muted-foreground/40">{r.domain}</p>
              <p className="text-[13px] text-foreground/80 leading-snug">{r.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground/50 font-mono line-clamp-2">{output_preview}</p>
        </div>
      )}
    </div>
  );
}

function KeywordResearchUI({ input, output_preview }: ToolUIProps) {
  const seeds = (input.keywords as string[]) ?? [];
  const results = parseKeywordResults(output_preview);

  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      {/* Seeds */}
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/30">
        <div className="flex items-center gap-1.5 flex-wrap">
          {seeds.slice(0, 4).map((kw) => (
            <span key={kw} className="font-mono text-[11px] border border-border/50 rounded px-1.5 py-px">{kw}</span>
          ))}
          {seeds.length > 4 && <span className="text-[10px] text-muted-foreground/40">+{seeds.length - 4}</span>}
        </div>
      </div>
      {/* Results as mini data table */}
      {results.length > 0 ? (
        <div className="px-4 py-2">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5">
            {results.map((r, i) => (
              <div key={i} className="contents">
                <span className="text-[12px] text-foreground/70 truncate">{r.keyword}</span>
                <span className="text-[11px] font-mono text-muted-foreground/50 text-right tabular-nums">{r.volume.toLocaleString()}/mo</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground/50 font-mono line-clamp-2">{output_preview}</p>
        </div>
      )}
    </div>
  );
}

function TavilySearchUI({ input, output_preview }: ToolUIProps) {
  const query = String(input.query ?? "");
  const results = parseSearchResults(output_preview);

  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      {/* Query */}
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/30">
        <p className="text-[13px] italic text-foreground/70">&ldquo;{query}&rdquo;</p>
      </div>
      {/* Web results as reader cards */}
      {results.length > 0 ? (
        <div className="divide-y divide-border/20">
          {results.map((r, i) => (
            <div key={i} className="px-4 py-2">
              <p className="text-[12px] text-foreground/70 leading-snug">{r.title}</p>
              <p className="text-[10px] font-mono text-muted-foreground/30 truncate mt-0.5">{r.url}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground/50 font-mono line-clamp-2">{output_preview}</p>
        </div>
      )}
    </div>
  );
}

function DefaultToolUI({ name, input, output_preview }: ToolUIProps) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/30">
        <code className="font-mono text-[11px]">{name}</code>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-muted-foreground/50 font-mono leading-relaxed line-clamp-2">
          {output_preview || JSON.stringify(input).slice(0, 150)}
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
