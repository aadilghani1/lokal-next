import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const hostname = request.headers.get("host") ?? "";

  // Subdomain-based blog routing: tenant1.blogger.com/article/slug -> /blog/tenant1/slug
  const blogDomain = process.env.BLOG_DOMAIN ?? "blogger.com";
  if (hostname.endsWith(blogDomain) && hostname !== blogDomain) {
    const tenant = hostname.replace(`.${blogDomain}`, "");
    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments[0] === "article" && pathSegments[1]) {
      const slug = pathSegments[1];
      return NextResponse.rewrite(
        new URL(`/blog/${tenant}/${slug}`, request.url)
      );
    }
  }

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
