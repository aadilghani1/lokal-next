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

function handleBlogRewrite(request: NextRequest): NextResponse | null {
  const hostname = request.headers.get("host") ?? "";
  const blogDomain = process.env.BLOG_DOMAIN ?? "blogger.com";

  if (!hostname.endsWith(blogDomain) || hostname === blogDomain) return null;

  const tenant = hostname.replace(`.${blogDomain}`, "");
  const pathSegments = new URL(request.url).pathname
    .split("/")
    .filter(Boolean);

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
