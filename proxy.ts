import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
  "/api/webhooks(.*)",
  "/api/photos(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
]);

const TENANT_SEO_ROUTES: Record<string, (tenant: string) => string> = {
  "/sitemap.xml": (t) => `/blog/${t}/sitemap.xml`,
  "/robots.txt": (t) => `/blog/${t}/robots.txt`,
  "/feed.xml": (t) => `/blog/${t}/feed.xml`,
  "/llms.txt": (t) => `/blog/${t}/llms.txt`,
  "/llms-full.txt": (t) => `/blog/${t}/llms-full.txt`,
};

function extractTenant(hostname: string): string | null {
  const blogDomain =
    process.env.BLOG_DOMAIN ?? process.env.NEXT_PUBLIC_BLOG_DOMAIN;

  if (blogDomain) {
    if (!hostname.endsWith(blogDomain) || hostname === blogDomain) return null;
    return hostname.replace(`.${blogDomain}`, "");
  }

  const localMatch = hostname.match(/^([^.]+)\.localhost(:\d+)?$/);
  if (localMatch) return localMatch[1];

  return null;
}

function handleBlogRewrite(request: NextRequest): NextResponse | null {
  const hostname = request.headers.get("host") ?? "";
  const tenant = extractTenant(hostname);
  if (!tenant) return null;

  const pathname = new URL(request.url).pathname;

  const seoRewrite = TENANT_SEO_ROUTES[pathname];
  if (seoRewrite) {
    return NextResponse.rewrite(new URL(seoRewrite(tenant), request.url));
  }

  // /blog/* paths: let Next.js handle them directly (internal route exists)
  if (pathname.startsWith("/blog/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/article/")) {
    const slug = pathname.slice("/article/".length).split("/")[0];
    if (slug) {
      return NextResponse.rewrite(
        new URL(`/blog/${tenant}/${slug}`, request.url),
      );
    }
  }

  // /api/* paths: pass through (e.g. /api/photos for images)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Root and any unrecognized path → blog index
  if (pathname === "/" || pathname === "") {
    return NextResponse.rewrite(new URL(`/blog/${tenant}`, request.url));
  }

  // Unknown subdomain paths → 404 via Next.js (don't silently show index)
  return NextResponse.next();
}

export default clerkMiddleware(async (auth, request) => {
  const blogRewrite = handleBlogRewrite(request);
  if (blogRewrite) return blogRewrite;

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
