import { NextResponse } from "next/server";
import { clearReceptionCookie } from "@/lib/auth";

export async function POST() {
  await clearReceptionCookie();
  return NextResponse.json({ ok: true });
}
