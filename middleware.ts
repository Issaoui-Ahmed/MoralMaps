import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildWwwAuthenticateHeader,
  isValidAdminBasicAuth,
} from "./src/utils/adminAuth";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": buildWwwAuthenticateHeader(),
    },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (isValidAdminBasicAuth(authHeader)) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'], // excludes /api, /_next, and static files
};
