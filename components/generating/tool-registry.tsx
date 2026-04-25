"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, GlobeIcon, BarChart3Icon, WrenchIcon } from "lucide-react";

interface ToolUIProps {
  name: string;
  input: Record<string, unknown>;
  output_preview: string;
}

type ToolRenderer = (props: ToolUIProps) => ReactNode;

function KeywordSerpUI({ input, output_preview }: ToolUIProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
        <SearchIcon className="size-3.5 text-blue-500" />
        <span className="text-xs font-medium">SERP Analysis</span>
        <Badge variant="outline" className="ml-auto text-[10px]">Google</Badge>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">&ldquo;{String(input.keyword)}&rdquo;</p>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-mono">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function KeywordResearchUI({ input, output_preview }: ToolUIProps) {
  const keywords = (input.keywords as string[]) ?? [];
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
        <BarChart3Icon className="size-3.5 text-purple-500" />
        <span className="text-xs font-medium">Keyword Research</span>
        <Badge variant="outline" className="ml-auto text-[10px]">DataForSEO</Badge>
      </div>
      <div className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {keywords.slice(0, 5).map((kw) => (
            <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>
          ))}
        </div>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 font-mono">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function TavilySearchUI({ input, output_preview }: ToolUIProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
        <GlobeIcon className="size-3.5 text-green-500" />
        <span className="text-xs font-medium">Web Search</span>
        <Badge variant="outline" className="ml-auto text-[10px]">Tavily</Badge>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">&ldquo;{String(input.query)}&rdquo;</p>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-mono">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function DefaultToolUI({ name, input, output_preview }: ToolUIProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
        <WrenchIcon className="size-3.5 text-muted-foreground" />
        <code className="text-xs font-mono">{name}</code>
        {output_preview && (
          <Badge variant="outline" className="ml-auto text-[10px] text-green-600 border-green-200">done</Badge>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] text-muted-foreground font-mono line-clamp-2">
          {JSON.stringify(input).slice(0, 120)}
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
