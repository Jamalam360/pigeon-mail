import countries from "./countries_by_coords.json" assert { type: "json" };
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.1";
import { AsyncRedactor } from "https://esm.sh/basic-redact-pii@1.0.0";
import Filter from "https://esm.sh/bad-words@3.0.4";

const filter = new Filter();
const redactor = new AsyncRedactor({
  builtInRedactors: {
    names: {
      enabled: false,
    },
  },
});

const supabase = createClient(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Deno.env.get("SUPABASE_URL")!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Message {
  content: string;
  sender: string;
  recipient: string;
  senderCountry: string;
  recipientCountry: string;
}

interface Country {
  country: string;
  north: number | null;
  south: number | null;
  east: number | null;
  west: number | null;
}

// Our pigeons travel fast!
const SPEED = 10_000;
const EARTH_RADIUS = 6371;

function calculateDeliveryTime(sender: string, recipient: string): number {
  const senderCoords = countries.find(
    (country) => country.country === sender
  ) as Country;
  const recipientCoords = countries.find(
    (country) => country.country === recipient
  ) as Country;

  return calculateDistance(senderCoords, recipientCoords) / SPEED;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateDistance(
  senderCoords: Country,
  recipientCoords: Country
): number {
  if (
    senderCoords.east === null ||
    senderCoords.west === null ||
    senderCoords.north === null ||
    senderCoords.south === null
  ) {
    return 1000;
  }

  if (
    recipientCoords.east === null ||
    recipientCoords.west === null ||
    recipientCoords.north === null ||
    recipientCoords.south === null
  ) {
    return 1000;
  }

  let lat1 = (senderCoords.north + senderCoords.south) / 2;
  const lon1 = (senderCoords.east + senderCoords.west) / 2;
  let lat2 = (recipientCoords.north + recipientCoords.south) / 2;
  const lon2 = (recipientCoords.east + recipientCoords.west) / 2;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(1000, EARTH_RADIUS * c);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  const { content, sender, recipient, senderCountry, recipientCountry } =
    (await req.json()) as Message;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (filter.isProfane(content)) {
    return new Response(
      JSON.stringify({
        error: "Profanity is not allowed",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  if (content.length < 80) {
    return new Response(
      JSON.stringify({
        error: "Message must be at least 80 characters",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  if (content.length > 2500) {
    return new Response(
      JSON.stringify({
        error: "Message must be less than 2500 characters",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const redacted = await redactor.redactAsync(content);

  if (redacted !== content) {
    return new Response(
      JSON.stringify({
        error: "Message contains disallowed content",
      }),
      {
        headers: corsHeaders,
      }
    );
  }

  const { error } = await supabase.from("messages").insert({
    sender,
    recipient,
    content,
    delivery_time: calculateDeliveryTime(senderCountry, recipientCountry),
  });

  if (error !== null) {
    return new Response("Error inserting message", {
      headers: corsHeaders,
    });
  }

  return new Response("Message sent", { status: 200, headers: corsHeaders });
});
