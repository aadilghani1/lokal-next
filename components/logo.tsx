import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M30 28 L30 55 Q30 72 50 72 Q70 72 70 55 L70 48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M40 38 L40 52 Q40 64 50 64 Q60 64 60 52 L60 50"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
