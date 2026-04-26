import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
  "/api/webhooks(.*)",
  "/api/photos(.*)",
]);

const TENANT_SEO_ROUTES: Record<string, (tenant: string) => string> = {
  "/sitemap.xml": (t) => `/blog/${t}/sitemap.xml`,
  "/robots.txt": (t) => `/blog/${t}/robots.txt`,
  "/feed.xml": (t) => `/blog/${t}/feed.xml`,
  "/llms.txt": (t) => `/blog/${t}/llms.txt`,
  "/llms-full.txt": (t) => `/blog/${t}/llms-full.txt`,
};

function extractTenant(hostname: string): string | null {
  const blogDomain = process.env.BLOG_DOMAIN;

  if (blogDomain) {
    if (!hostname.endsWith(blogDomain) || hostname === blogDomain) return null;
    return hostname.replace(`.${blogDomain}`, "");
  }

  // Local dev: match {tenant}.localhost or {tenant}.localhost:PORT
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

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments[0] === "article" && pathSegments[1]) {
    return NextResponse.rewrite(
      new URL(`/blog/${tenant}/${pathSegments[1]}`, request.url)
    );
  }

  return NextResponse.rewrite(new URL(`/blog/${tenant}`, request.url));
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
