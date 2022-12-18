import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.1";

interface Req {
  id: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Deno.env.get("SUPABASE_URL")!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  const { id } = (await req.json()) as Req;

  const { data: user, error: userError } =
    await supabase.auth.admin.getUserById(id);

  if (userError != null || user == null) {
    return new Response(
      JSON.stringify({
        error: "Could not find user",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("id")
    .eq("id", id);

  if (userDataError != null || userData.length > 0) {
    return new Response(
      JSON.stringify({
        error: "User cannot be removed",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  await supabase.auth.admin.deleteUser(id);

  return new Response(JSON.stringify({}), {
    headers: corsHeaders,
  });
});
