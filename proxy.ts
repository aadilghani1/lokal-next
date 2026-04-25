import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const hostname = request.headers.get("host") ?? "";

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

    return NextResponse.rewrite(
      new URL(`/blog/${tenant}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
