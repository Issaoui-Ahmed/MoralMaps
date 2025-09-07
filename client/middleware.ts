import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const [type, encoded] = auth.split(" ");
  if (type === "Basic") {
    const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
    if (user === "admin" && pass === "admin") {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
