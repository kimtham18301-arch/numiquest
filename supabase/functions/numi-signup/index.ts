// Edge Function `numi-signup`: creates a username + PIN account (Supabase rejects made-up email domains
// on public signup, so this function uses admin rights). Paste this file into Supabase → Edge Functions.
// Needs the `numi_signup_allowed` function from cloud-setup.sql (v2.6 section).
import { withSupabase } from "jsr:@supabase/server@^1";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const RESERVED = new Set(["admin", "root", "support"]);
const MAX_PER_HOUR = 40;

async function ipHash(req: Request): Promise<string> {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("numi-ip:" + ip));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// deno-lint-ignore no-explicit-any
async function limited(admin: any, req: Request): Promise<boolean> {
  const { data, error } = await admin.rpc("numi_signup_allowed", { p_ip_hash: await ipHash(req), p_max: MAX_PER_HOUR });
  // Counter broken (usually the v2.6 SQL was not run): log it and let the sign-up through, so a whole class
  // is not locked out by a setup mistake. If the database itself is down, createUser fails anyway.
  if (error) {
    console.error("numi_signup_allowed failed:", error.message);
    return false;
  }
  return data !== true;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, _ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    try {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      if (await limited(admin, req)) return json({ error: "rate_limited" }, 429);
      const { username, password, name, avatar, grade, role } = await req.json();
      const u = String(username || "").trim().toLowerCase();
      if (!/^[a-z0-9_.-]{2,40}$/.test(u) || RESERVED.has(u)) return json({ error: "bad_username" }, 400);
      if (typeof password !== "string" || password.length < 6 || password.length > 72) return json({ error: "bad_password" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email: u + "@numiquick.app",
        password,
        email_confirm: true,
        user_metadata: {
          username: u,
          name: String(name || u).slice(0, 30),
          avatar: String(avatar || "bunny").slice(0, 20),
          grade: Math.min(9, Math.max(1, Number(grade) || 1)),
          role: role === "teacher" ? "teacher" : "student",
        },
      });
      if (error) return json({ error: error.message }, (error as any).status === 422 ? 409 : 400);
      return json({ ok: true, id: data.user.id });
    } catch (_e) {
      return json({ error: "server" }, 500);
    }
  }),
};
