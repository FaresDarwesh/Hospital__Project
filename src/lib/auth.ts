import crypto from "crypto";
import { cookies } from "next/headers";

function requiredEnv(name: "SESSION_SECRET" | "ADMIN_PASSWORD"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

const SECRET = requiredEnv("SESSION_SECRET");
export const ADMIN_PASSWORD = requiredEnv("ADMIN_PASSWORD");

export function hashAccessPassword(password: string): string {
  return crypto.createHash("sha256").update(password, "utf8").digest("hex");
}

const ADMIN_COOKIE = "bn_admin_token";
const ASSISTANT_COOKIE = "bn_assistant_token";
const MAX_AGE = 60 * 60 * 24 * 7; // أسبوع

function hmac(data: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 40);
}

export function signToken(payload: string): string {
  const ts = Date.now().toString();
  const data = `${payload}.${ts}`;
  return `${data}.${hmac(data)}`;
}

export function verifyToken(
  token: string | undefined,
  payloadPrefix: string
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [payload, ts, sig] = parts;
  const expected = hmac(`${payload}.${ts}`);
  if (expected !== sig) return null;
  if (Date.now() - Number(ts) > MAX_AGE * 1000) return null;
  if (!payload.startsWith(payloadPrefix)) return null;
  return payload;
}

const SECURE = process.env.NODE_ENV === "production";

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, signToken("admin"), {
    httpOnly: true, // لا يمكن قراءته من JavaScript (حماية XSS)
    secure: SECURE, // HTTPS فقط في الإنتاج
    sameSite: "lax", // حماية من CSRF للطلبات عبر المواقع
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function setAssistantCookie(departmentId: number): Promise<void> {
  const store = await cookies();
  store.set(ASSISTANT_COOKIE, signToken(`asst-dept:${departmentId}`), {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function clearAssistantCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ASSISTANT_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return !!verifyToken(store.get(ADMIN_COOKIE)?.value, "admin");
}

export async function getAssistantDepartmentId(): Promise<number | null> {
  const store = await cookies();
  const payload = verifyToken(store.get(ASSISTANT_COOKIE)?.value, "asst-dept:");
  if (!payload) return null;
  const id = Number(payload.split(":")[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}
