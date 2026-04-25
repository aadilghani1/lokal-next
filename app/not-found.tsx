import { Button } from "@/components/ui/button";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <MagnifyingGlass className="size-10 text-muted-foreground" weight="duotone" />
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          404
        </h2>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a href="/">
          <Button variant="outline" size="sm">
            Back to home
          </Button>
        </a>
      </div>
    </div>
  );
}
