"use client";

import { Heatmap } from "@paper-design/shaders-react";

export function GrainShader({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Heatmap
        image="https://shaders.paper.design/images/logos/diamond.svg"
        style={{ width: "100%", height: "100%" }}
        colors={[
          "#FFFBEB",
          "#FEF3C7",
          "#FDE68A",
          "#FBBF24",
          "#F59E0B",
          "#D97706",
          "#92400E",
        ]}
        colorBack="#FFFDF7"
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
