
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const allowedOrigins = (
  process.env.FRONTEND_URLS || ""
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const publicPaths = [
  "/api/v1//auth/superAdmin",
  "/api/superadmin/logout",
];

function addCors(
  response: NextResponse,
  origin: string | null
) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
    response.headers.append("Vary", "Origin");
  }

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  const isApi = pathname.startsWith("/api/");
  const isLoginPage = pathname === "/superadmin/login";

  const isSuperAdminPage =
    pathname === "/superadmin" ||
    (pathname.startsWith("/superadmin/") && !isLoginPage);

  const isSuperAdminApi =
    pathname.startsWith("/api/superadmin/");

  // Validate frontend origins for API requests
  if (isApi && origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { success: false, message: "Origin not allowed" },
      { status: 403 }
    );
  }

  // Handle preflight
  if (isApi && req.method === "OPTIONS") {
    return addCors(
      new NextResponse(null, { status: 204 }),
      origin
    );
  }

  // Public routes
  if (publicPaths.includes(pathname) || isLoginPage) {
    return addCors(NextResponse.next(), origin);
  }

  // Protect SuperAdmin routes
  if (isSuperAdminPage || isSuperAdminApi) {
    const token = req.cookies.get("superadmin_token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      if (isApi) {
        return addCors(
          NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
          ),
          origin
        );
      }

      return NextResponse.redirect(
        new URL("/superadmin/login", req.url)
      );
    }

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret)
      );

      if (
        payload.role !== "SuperAdmin" ||
        !payload.id ||
        !payload.superAdminId
      ) {
        throw new Error("Invalid token");
      }

      const requestHeaders = new Headers(req.headers);

      requestHeaders.set("x-superadmin-id", String(payload.id));
      requestHeaders.set(
        "x-superadmin-code",
        String(payload.superAdminId)
      );

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return addCors(response, origin);

    } catch {
      if (isApi) {
        const response = NextResponse.json(
          {
            success: false,
            message: "Session expired",
          },
          { status: 401 }
        );

        response.cookies.delete("superadmin_token");

        return addCors(response, origin);
      }

      const response = NextResponse.redirect(
        new URL("/superadmin/login", req.url)
      );

      response.cookies.delete("superadmin_token");

      return response;
    }
  }

  return addCors(NextResponse.next(), origin);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/superadmin/:path*",
  ],
};
