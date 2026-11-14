
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

const PUBLIC_ROUTES = [
  "/api/v1/auth/teacher/login",
  "/api/v1/auth/teacher/register",
  "/api/v1/auth/admin/register",
  "/api/v1/auth/admin/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/admin/login",
  "/teacher/login",
];


const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = new Headers();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin");
  }

  return headers;
}

function withCors(
  req: NextRequest,
  response: NextResponse
) {
  const headers = getCorsHeaders(req);

  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. CORS headers
  const corsHeaders = getCorsHeaders(req);

  // 2. Handle preflight before authentication
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 3. Public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return withCors(req, NextResponse.next());
  }

  // 4. Public GET - Fetch all active posts
if (
  pathname === "/api/v1/post" &&
  req.method === "GET"
) {
  return withCors(req, NextResponse.next());
}

// 5. Public PUT - Update individual post
if (
  /^\/api\/v1\/post\/[^/]+$/.test(pathname) &&
  req.method === "PUT"
) {
  return withCors(req, NextResponse.next());
}


  // 4. JWT authentication
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return withCors(req, unauthorized(req));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (
      !payload.id ||
      !["Admin", "Teacher"].includes(String(payload.role))
    ) {
      return withCors(req, unauthorized(req));
    }

    const requestHeaders = new Headers(req.headers);

    requestHeaders.set("x-user-id", String(payload.id));
    requestHeaders.set("x-user-role", String(payload.role));

    if (payload.adminId) {
      requestHeaders.set(
        "x-admin-id",
        String(payload.adminId)
      );
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return withCors(req, response);
  } catch {
    return withCors(req, unauthorized(req));
  }
}

function unauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.redirect(
    new URL("/", req.url)
  );

  response.cookies.delete("access_token");

  return response;
}

export const config = {
  matcher: [
    "/api/v1/:path*",
  ],
};
