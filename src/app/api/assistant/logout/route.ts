import { NextResponse } from "next/server";
import { clearAssistantCookie } from "@/lib/auth";

export async function POST() {
  await clearAssistantCookie();
  return NextResponse.json({ ok: true });
}
