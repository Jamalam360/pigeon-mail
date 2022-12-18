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

  const { id: reporterId } = (await req.json()) as Req;

  const { data: reporter, error: reporterError } = await supabase
    .from("users")
    .select("pen_pal")
    .eq("id", reporterId)
    .limit(1)
    .single();

  if (reporterError != null || reporter == null || reporter.pen_pal == null) {
    console.error(JSON.stringify(reporterError));
    return new Response(
      JSON.stringify({
        error: "Could not find user",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const { data: previousReport } = await supabase
    .from("reports")
    .select("*")
    .eq("reporter", reporterId)
    .eq("user", reporter.pen_pal);

  if ((previousReport ?? []).length > 0) {
    return new Response(
      JSON.stringify({
        error: "You have already reported this user",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      reporter: reporterId,
      user: reporter.pen_pal,
    })
    .returns<{ id: number }>();

  if (insertError != null) {
    console.error(JSON.stringify(insertError));
    return new Response(
      JSON.stringify({
        error: "Could not insert report",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("content,sent_at,sender,recipient")
    .or(
      `sender.eq.${reporterId},recipient.eq.${reporterId},sender.eq.${
        reporter.pen_pal as string
      },recipient.eq.${reporter.pen_pal as string}`
    )
    .order("sent_at", { ascending: false });

  if (messagesError != null) {
    console.error(JSON.stringify(messagesError));
    return new Response(
      JSON.stringify({
        error: "Could not find messages",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  messages.forEach((message) => {
    // @ts-expect-error blegh
    // eslint-disable-next-line @typescript-eslint/dot-notation
    message["report_id"] = report[0].id;
  });

  const { error: insertMessagesError } = await supabase
    .from("reported_messages")
    .insert(messages);

  if (insertMessagesError != null) {
    console.error(JSON.stringify(insertMessagesError));
    return new Response(
      JSON.stringify({
        error: "Could not insert messages",
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
