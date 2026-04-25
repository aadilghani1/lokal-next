"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { publishArticle } from "@/services/article-service";
import { SpinnerGap, Rocket } from "@phosphor-icons/react/dist/ssr";

interface PublishButtonProps {
  articleId: string;
}

export function PublishButton({ articleId }: PublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePublish() {
    setLoading(true);
    try {
      await publishArticle(articleId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePublish}
      disabled={loading}
      size="sm"
      className="gap-1.5"
    >
      {loading ? (
        <SpinnerGap className="size-3.5 animate-spin" weight="bold" />
      ) : (
        <Rocket className="size-3.5" weight="bold" />
      )}
      {loading ? "Publishing..." : "Publish"}
    </Button>
  );
}
