import { createClient, User } from "@supabase/supabase-js";
import type { Database } from "./types.gen";
import cookie from "cookie";

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
);

export type PigeonMailUser = {
  auth: User;
  data: Database["public"]["Tables"]["users"]["Row"];
};

export async function getUser(req: Request): Promise<PigeonMailUser | null> {
  const c = cookie.parse(req.headers.get("cookie") ?? "");

  if (!c.sbat && !c.sbrt) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(c.sbat);

  if (!user || user.role !== "authenticated") {
    if (!c.sbrt) {
      return null;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({ refresh_token: c.sbrt });

    if (!session || error?.message) {
      return null;
    }

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: session.access_token,
        expires_in: session.expires_in,
        refresh_token: session.refresh_token,
      }),
    });

    if (!res.ok) {
      return null;
    }

    return await getUser(req);
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .limit(1)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return {
    auth: user,
    data,
  };
}

export async function isLoggedIn(req: Request) {
  return (await getUser(req)) !== null;
}
