import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/blog-url";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
