import { createClient, User } from "@supabase/supabase-js";
import type { Database } from "./types.gen";
import cookie from "cookie";

export type UserData = Database["public"]["Tables"]["users"]["Row"];
export type UserStatistics =
  Database["public"]["Tables"]["user_statistics"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
);

export interface PigeonMailUser {
  auth: User;
  data: UserData;
}

export async function getUser(req: Request): Promise<PigeonMailUser | null> {
  const c = cookie.parse(req.headers.get("cookie") ?? "");

  if (c.sbat == null) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(c.sbat);

  if (user == null || user.role !== "authenticated") {
    if (c.sbrt == null) {
      return null;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({ refresh_token: c.sbrt });

    if (session == null || error != null) {
      return null;
    }

    const res = await fetch("https://pigeon-mail.pages.dev/api/login", {
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

  if (error != null) {
    console.error(error);
    return null;
  }

  return {
    auth: user,
    data,
  };
}

export async function isLoggedIn(req: Request): Promise<boolean> {
  return (await getUser(req)) !== null;
}

export async function getUserStatistics(
  userId: string
): Promise<UserStatistics> {
  const { data } = await supabase
    .from("user_statistics")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return data!;
}
