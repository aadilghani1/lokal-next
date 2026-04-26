"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auditUrlFormSchema, type AuditUrlFormInput } from "@/domains/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ArrowRight, CircleNotch, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function AuditUrlForm() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuditUrlFormInput>({
    resolver: zodResolver(auditUrlFormSchema),
    defaultValues: { url: "" },
  });

  function onSubmit(data: AuditUrlFormInput) {
    setIsNavigating(true);
    router.push(`/dashboard/audit?url=${encodeURIComponent(data.url)}`);
  }

  const isLoading = isNavigating;

  return (
    <Card className="shadow-(--shadow-surface)">
      <CardContent className="py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8">
            <MagnifyingGlass className="size-5 text-primary" weight="duotone" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Run an audit</span>
            <span className="text-xs text-muted-foreground">
              Paste a Google Maps URL to get started.
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                {...register("url")}
                type="url"
                placeholder="https://www.google.com/maps/place/Your+Business..."
                disabled={isLoading}
                aria-invalid={!!errors.url}
                className={errors.url ? "border-destructive focus-visible:ring-destructive" : ""}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <CircleNotch className="size-3.5 animate-spin" weight="bold" />
                  Loading
                </>
              ) : (
                <>
                  Audit
                  <ArrowRight className="size-3.5" weight="bold" />
                </>
              )}
            </Button>
          </div>
          {errors.url && (
            <div className="flex items-center gap-1.5 text-destructive">
              <WarningCircle className="size-3.5 shrink-0" weight="bold" />
              <span className="text-xs">{errors.url.message}</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
