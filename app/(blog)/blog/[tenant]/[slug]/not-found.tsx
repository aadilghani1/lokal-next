import { Button } from "@/components/ui/button";
import { FileX } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function BlogArticleNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <FileX className="size-10 text-muted-foreground" weight="duotone" />
        <h2 className="font-heading text-lg font-semibold">
          Article not found
        </h2>
        <p className="text-sm text-muted-foreground">
          This article doesn&apos;t exist or has been removed.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
