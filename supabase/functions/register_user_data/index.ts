import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.1";

interface Req {
  id: string;
  name: string;
  country: string;
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

const colors = ["3b434f", "adb4bd", "fdca4d", "666e7a"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: corsHeaders,
    });
  }

  const { id, name, country } = (await req.json()) as Req;

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", id);

  if (existing != null && existing.length > 0) {
    return new Response(
      JSON.stringify({
        error: "User already exists",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  const { error } = await supabase.from("users").insert({
    id,
    country: country.startsWith("The") ? "t" + country.slice(1) : country,
    name,
    avatar: `https://boring-avatars-service-seven.vercel.app//beam/120/${name}?colors=${colors.join(
      ","
    )}`,
  });

  if (error != null) {
    await supabase.functions.invoke("remove_failed_user", {
      body: {
        id,
      },
    });

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  return new Response(JSON.stringify({}), {
    headers: corsHeaders,
  });
});
