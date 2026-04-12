// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "npm:@supabase/supabase-js@2";
// import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// // ✅ Set your allowed origins here
// const ALLOWED_ORIGINS = new Set<string>([
//   "https://hellskitchenwine-571619613032.us-central1.run.app",
//   "http://localhost:5173",
//   "http://localhost:3000",
// ]);

// function getCorsHeaders(req: Request): Record<string, string> {
//   const origin = req.headers.get("origin") ?? "";
//   const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "null";

//   return {
//     "Access-Control-Allow-Origin": allowOrigin,
//     "Vary": "Origin",
//     "Access-Control-Allow-Methods": "POST, OPTIONS",
//     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//     "Access-Control-Max-Age": "86400",
//   };
// }

// interface SendSmsRequest {
//   customerIds?: string[];
//   phoneNumbers?: string[];
//   messageBody: string;
//   pointsThreshold?: number;
// }

// // ---- helpers ----
// function chunk<T>(arr: T[], size: number): T[][] {
//   const out: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//   return out;
// }

// /**
//  * Supabase/PostgREST will put `.in(...)` values in the URL query string.
//  * Large lists -> huge URL -> "TypeError: Invalid URL".
//  * Chunking prevents URL blowups.
//  */
// const IN_CLAUSE_CHUNK_SIZE = 200;

// async function fetchCustomersByIds(
//   supabaseClient: ReturnType<typeof createClient>,
//   ids: string[]
// ) {
//   const batches = chunk(ids, IN_CLAUSE_CHUNK_SIZE);
//   const all: any[] = [];

//   for (const batch of batches) {
//     const { data, error } = await supabaseClient
//       .from("customers")
//       .select("id, phone, first_name, points, opted_out")
//       .in("id", batch)
//       .eq("opted_out", false);

//     if (error) throw error;
//     if (data?.length) all.push(...data);
//   }

//   return all;
// }

// async function fetchCustomersByPhones(
//   supabaseClient: ReturnType<typeof createClient>,
//   phones: string[]
// ) {
//   const batches = chunk(phones, IN_CLAUSE_CHUNK_SIZE);
//   const all: any[] = [];

//   for (const batch of batches) {
//     const { data, error } = await supabaseClient
//       .from("customers")
//       .select("id, phone, first_name, points, opted_out")
//       .in("phone", batch)
//       .eq("opted_out", false);

//     if (error) throw error;
//     if (data?.length) all.push(...data);
//   }

//   return all;
// }

// serve(async (req: Request) => {
//   const corsHeaders = getCorsHeaders(req);

//   if (req.method === "OPTIONS") {
//     return new Response(null, { status: 204, headers: corsHeaders });
//   }

//   if (req.method !== "POST") {
//     return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
//       status: 405,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   }

//   try {
//     const origin = req.headers.get("origin") ?? "";
//     if (!ALLOWED_ORIGINS.has(origin)) {
//       return new Response(
//         JSON.stringify({ success: false, error: `Origin not allowed: ${origin}` }),
//         { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Supabase env
//     const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
//     const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
//     if (!supabaseUrl || !serviceRoleKey) {
//       throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function env");
//     }

//     const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

//     // Twilio settings
//     const { data: settings, error: settingsError } = await supabaseClient
//       .from("settings")
//       .select("key, value")
//       .in("key", ["twilio_account_sid", "twilio_auth_token", "twilio_phone_number"]);

//     if (settingsError || !settings) {
//       throw new Error("Failed to fetch Twilio settings");
//     }

//     const settingsMap = settings.reduce((acc, row) => {
//       acc[row.key as string] = row.value as string;
//       return acc;
//     }, {} as Record<string, string>);
//     //referrence here to avoid truncation

//     const twilioAccountSid = settingsMap.twilio_account_sid;
//     const twilioAuthToken = settingsMap.twilio_auth_token;
//     const twilioPhoneNumber = settingsMap.twilio_phone_number;

//     if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
//       throw new Error("Twilio credentials not configured");
//     }

//     // Parse request body
//     const body: SendSmsRequest = await req.json();
//     const { customerIds, phoneNumbers, messageBody, pointsThreshold } = body;

//     if (!messageBody || typeof messageBody !== "string") {
//       throw new Error("Message body is required");
//     }

//     // Query customers based on criteria
//     let customers: any[] = [];

//     if (customerIds?.length) {
//       customers = await fetchCustomersByIds(supabaseClient, customerIds);
//     } else if (phoneNumbers?.length) {
//       customers = await fetchCustomersByPhones(supabaseClient, phoneNumbers);
//     } else if (pointsThreshold !== undefined) {
//       const { data, error } = await supabaseClient
//         .from("customers")
//         .select("id, phone, first_name, points, opted_out")
//         .gte("points", pointsThreshold)
//         .eq("opted_out", false);

//       if (error) throw error;
//       customers = data ?? [];
//     } else {
//       throw new Error("Must provide customerIds, phoneNumbers, or pointsThreshold");
//     }

//     const results: Array<{ phone: string; status: string; error?: string }> = [];

//     const twilioUrl =
//       `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
//     const authHeader = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`;

//     for (const customer of customers) {
//       const personalizedMessage = messageBody
//         .replace(/\{name\}/g, String(customer.first_name ?? ""))
//         .replace(/\{points\}/g, String(customer.points ?? ""));

//       const messageRecord: any = {
//         customer_id: customer.id,
//         phone: customer.phone,
//         message_body: personalizedMessage,
//         status: "pending",
//       };

//       try {
//         const formData = new URLSearchParams();
//         formData.append("To", customer.phone);
//         formData.append("From", twilioPhoneNumber);
//         formData.append("Body", personalizedMessage);

//         const resp = await fetch(twilioUrl, {
//           method: "POST",
//           headers: {
//             "Authorization": authHeader,
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: formData.toString(),
//         });

//         if (resp.ok) {
//           const twilioResp = await resp.json();
//           messageRecord.status = "sent";
//           messageRecord.twilio_sid = twilioResp.sid;
//           messageRecord.sent_at = new Date().toISOString();
//           results.push({ phone: customer.phone, status: "sent" });
//         } else {
//           const errorText = await resp.text();
//           messageRecord.status = "failed";
//           messageRecord.error_message = errorText;
//           results.push({ phone: customer.phone, status: "failed", error: errorText });
//         }
//       } catch (err: any) {
//         const msg = err?.message ?? String(err);
//         messageRecord.status = "failed";
//         messageRecord.error_message = msg;
//         results.push({ phone: customer.phone, status: "failed", error: msg });
//       }

//       // Save message record (don’t crash if insert fails)
//       await supabaseClient.from("messages").insert(messageRecord);

//       // Rate limit: 100ms between messages
//       await new Promise((r) => setTimeout(r, 100));
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         totalCustomers: customers.length,
//         results,
//       }),
//       {
//         status: 200,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   } catch (err: any) {
//     return new Response(JSON.stringify({ success: false, error: err?.message ?? String(err) }), {
//       status: 400,
//       headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
//     });
//   }
// });
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Twilio error codes that mean the number is invalid / can never receive SMS.
// When we see these we auto-opt-out the customer so they're never targeted again.
const INVALID_NUMBER_CODES = new Set([
  21211, // Invalid 'To' phone number
  21214, // 'To' phone number cannot receive SMS messages
  21217, // Phone number does not appear to be valid
  21401, // Invalid phone number
  21407, // Phone number can only receive calls, not SMS
  21610, // Attempt to send to unsubscribed recipient (replied STOP via another channel)
  30003, // Unreachable destination handset
  30004, // Message blocked by carrier
  30005, // Unknown destination handset (number deactivated)
  30006, // Landline or unreachable carrier — cannot receive SMS
  32204, // Invalid To number
]);

// ✅ Set your allowed origins here
const ALLOWED_ORIGINS = new Set<string>([
  "https://hellskitchenwine-571619613032.us-central1.run.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

interface SendSmsRequest {
  customerIds?: string[];
  phoneNumbers?: string[];
  messageBody: string;
  pointsThreshold?: number;
  mediaUrl?: string | null;
  campaignId?: string | null;
}

// ---- helpers ----
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Supabase/PostgREST will put `.in(...)` values in the URL query string.
 * Large lists -> huge URL -> "TypeError: Invalid URL".
 * Chunking prevents URL blowups.
 */
const IN_CLAUSE_CHUNK_SIZE = 200;

async function fetchCustomersByIds(
  supabaseClient: ReturnType<typeof createClient>,
  ids: string[]
) {
  const batches = chunk(ids, IN_CLAUSE_CHUNK_SIZE);
  const all: any[] = [];

  for (const batch of batches) {
    const { data, error } = await supabaseClient
      .from("customers")
      .select("id, phone, first_name, points, opted_out")
      .in("id", batch)
      .eq("opted_out", false);

    if (error) throw error;
    if (data?.length) all.push(...data);
  }

  return all;
}

async function fetchCustomersByPhones(
  supabaseClient: ReturnType<typeof createClient>,
  phones: string[]
) {
  const batches = chunk(phones, IN_CLAUSE_CHUNK_SIZE);
  const all: any[] = [];

  for (const batch of batches) {
    const { data, error } = await supabaseClient
      .from("customers")
      .select("id, phone, first_name, points, opted_out")
      .in("phone", batch)
      .eq("opted_out", false);

    if (error) throw error;
    if (data?.length) all.push(...data);
  }

  return all;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const origin = req.headers.get("origin") ?? "";
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response(
        JSON.stringify({ success: false, error: `Origin not allowed: ${origin}` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function env");
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("key, value")
      .in("key", ["twilio_account_sid", "twilio_auth_token", "twilio_phone_number"]);

    if (settingsError || !settings) {
      throw new Error("Failed to fetch Twilio settings");
    }

    const settingsMap = settings.reduce((acc, row) => {
      acc[row.key as string] = row.value as string;
      return acc;
    }, {} as Record<string, string>);

    const twilioAccountSid = settingsMap.twilio_account_sid;
    const twilioAuthToken = settingsMap.twilio_auth_token;
    const twilioPhoneNumber = settingsMap.twilio_phone_number;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const body: SendSmsRequest = await req.json();
    const { customerIds, phoneNumbers, messageBody, pointsThreshold, mediaUrl, campaignId } = body;

    if (!messageBody || typeof messageBody !== "string") {
      throw new Error("Message body is required");
    }

    if (mediaUrl !== undefined && mediaUrl !== null) {
      try {
        const parsed = new URL(mediaUrl);
        if (parsed.protocol !== "https:") {
          throw new Error("Media URL must use HTTPS");
        }
      } catch {
        throw new Error("Invalid media URL");
      }
    }

    let customers: any[] = [];

    if (customerIds?.length) {
      customers = await fetchCustomersByIds(supabaseClient, customerIds);
    } else if (phoneNumbers?.length) {
      customers = await fetchCustomersByPhones(supabaseClient, phoneNumbers);
    } else if (pointsThreshold !== undefined) {
      const { data, error } = await supabaseClient
        .from("customers")
        .select("id, phone, first_name, points, opted_out")
        .gte("points", pointsThreshold)
        .eq("opted_out", false);

      if (error) throw error;
      customers = data ?? [];
    } else {
      throw new Error("Must provide customerIds, phoneNumbers, or pointsThreshold");
    }

    const results: Array<{ phone: string; status: string; error?: string }> = [];

    // SMS costs: $0.0079/SMS, $0.0200/MMS
    const isMms = !!(mediaUrl);
    const costPerMessage = isMms ? 0.0200 : 0.0079;

    const twilioUrl =
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const authHeader = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`;

    let sentCount = 0;
    let failedCount = 0;

    for (const customer of customers) {
      const personalizedMessage = messageBody
        .replace(/\{name\}/g, String(customer.first_name ?? ""))
        .replace(/\{points\}/g, String(customer.points ?? ""));

      const messageRecord: any = {
        customer_id: customer.id,
        phone: customer.phone,
        message_body: personalizedMessage,
        media_url: mediaUrl ?? null,
        status: "pending",
        campaign_id: campaignId,
      };

      try {
        const formData = new URLSearchParams();
        formData.append("To", customer.phone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", personalizedMessage);

        if (mediaUrl) {
          formData.append("MediaUrl", mediaUrl);
        }

        const resp = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (resp.ok) {
          const twilioResp = await resp.json();
          messageRecord.status = "sent";
          messageRecord.twilio_sid = twilioResp.sid;
          messageRecord.sent_at = new Date().toISOString();
          messageRecord.cost = costPerMessage;
          results.push({ phone: customer.phone, status: "sent" });
          sentCount++;
        } else {
          // Parse Twilio error JSON to get the numeric code and a clean message
          let twilioCode: number | null = null;
          let cleanError = "";
          try {
            const errJson = await resp.json();
            twilioCode = errJson.code ?? null;
            cleanError = errJson.message
              ? `[${errJson.code}] ${errJson.message}`
              : JSON.stringify(errJson);
          } catch {
            cleanError = await resp.text();
          }

          messageRecord.status = "failed";
          messageRecord.error_message = cleanError;
          results.push({ phone: customer.phone, status: "failed", error: cleanError });
          failedCount++;

          // Auto opt-out customers with permanently invalid/unreachable numbers
          if (twilioCode && INVALID_NUMBER_CODES.has(twilioCode) && customer.id) {
            await supabaseClient
              .from("customers")
              .update({ opted_out: true })
              .eq("id", customer.id);
          }
        }
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        messageRecord.status = "failed";
        messageRecord.error_message = msg;
        results.push({ phone: customer.phone, status: "failed", error: msg });
        failedCount++;
      }

      await supabaseClient.from("messages").insert(messageRecord);
      await new Promise((r) => setTimeout(r, 100));
    }

    // Increment campaign totals after all sends
    if (campaignId) {
      const { data: current } = await supabaseClient
        .from("campaigns")
        .select("total_customers, total_sent, total_failed, total_cost")
        .eq("id", campaignId)
        .single();

      if (current) {
        await supabaseClient
          .from("campaigns")
          .update({
            total_customers: current.total_customers + customers.length,
            total_sent: current.total_sent + sentCount,
            total_failed: current.total_failed + failedCount,
            total_cost: parseFloat(
              (Number(current.total_cost) + sentCount * costPerMessage).toFixed(2)
            ),
          })
          .eq("id", campaignId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalCustomers: customers.length,
        results,
        campaignId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message ?? String(err) }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});