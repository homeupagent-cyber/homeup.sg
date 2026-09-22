import { NextRequest, NextResponse } from "next/server";
import { NEW_LAUNCH_COOKIE_NAME } from "@/lib/new-launch/cookie";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/new-launch/login", request.url));
  response.cookies.set(NEW_LAUNCH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
