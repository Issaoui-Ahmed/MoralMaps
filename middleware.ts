import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const loginPath = "/admin/login";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = loginPath;
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === loginPath) {
    return NextResponse.next();
  }

  const authed = req.cookies.get("adminAuth")?.value === "1";
  if (authed) {
    return NextResponse.next();
  }

  return redirectToLogin(req);
}

export const config = {
  matcher: ["/admin/:path*"],
};
