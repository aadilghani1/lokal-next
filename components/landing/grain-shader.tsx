"use client";

import { Heatmap } from "@paper-design/shaders-react";

export function GrainShader({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Heatmap
        image="https://shaders.paper.design/images/logos/diamond.svg"
        style={{ width: "100%", height: "100%" }}
        colors={[
          "#FFF6ED",
          "#E8C9A8",
          "#FFF0E0",
          "#D4A574",
          "#FFE8D0",
          "#C08E5E",
          "#FFF3E6",
        ]}
        colorBack="#FFFAF5"
        contour={0.35}
        angle={25}
        noise={0.15}
        innerGlow={0.4}
        outerGlow={0.6}
        speed={0.3}
        scale={0.9}
      />
    </div>
  );
}
