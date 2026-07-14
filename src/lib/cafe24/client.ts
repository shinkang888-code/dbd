// filepath: src/lib/cafe24/client.ts
import {
  cafe24ApiVersion,
  cafe24BaseUrl,
  cafe24Configured,
  cafe24ShopNo,
} from "./config";

export class Cafe24ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "Cafe24ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOpts = {
  method?: string;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  scope?: "front" | "admin";
};

function frontAuthHeader() {
  const clientId = process.env.CAFE24_FRONT_CLIENT_ID!.trim();
  const apiKey = process.env.CAFE24_FRONT_API_KEY?.trim();
  const token = process.env.CAFE24_ACCESS_TOKEN?.trim();
  if (apiKey) {
    const basic = Buffer.from(`${clientId}:${apiKey}`).toString("base64");
    return {
      Authorization: `Basic ${basic}`,
      "X-Cafe24-Client-Id": clientId,
    };
  }
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "X-Cafe24-Client-Id": clientId,
    };
  }
  throw new Error("Cafe24 Front 자격증명 없음");
}

function adminAuthHeader() {
  const token = process.env.CAFE24_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("CAFE24_ACCESS_TOKEN 필요 (Admin API)");
  return { Authorization: `Bearer ${token}` };
}

export async function cafe24Fetch<T>(opts: RequestOpts): Promise<T> {
  if (!cafe24Configured() && opts.scope !== "admin") {
    throw new Error("Cafe24 not configured");
  }

  const scope = opts.scope ?? "front";
  const prefix = scope === "admin" ? "/admin" : "";
  const url = new URL(`${cafe24BaseUrl()}${prefix}${opts.path}`);
  url.searchParams.set("shop_no", String(cafe24ShopNo()));
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const auth = scope === "admin" ? adminAuthHeader() : frontAuthHeader();
  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      ...auth,
      "Content-Type": "application/json",
      "X-Cafe24-Api-Version": cafe24ApiVersion(),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: { revalidate: scope === "front" && (opts.method ?? "GET") === "GET" ? 60 : 0 },
  });

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg =
      typeof json === "object" && json && "error" in json
        ? JSON.stringify((json as { error: unknown }).error)
        : `Cafe24 ${res.status}`;
    throw new Cafe24ApiError(msg, res.status, json);
  }

  return json as T;
}
