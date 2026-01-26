// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "npm:@supabase/supabase-js@2";


// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
// };

// interface SendSmsRequest {
//   customerIds?: string[];
//   phoneNumbers?: string[];
//   messageBody: string;
//   pointsThreshold?: number;
// }

// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   }

//   try {
//     const supabaseClient = createClient(
//       Deno.env.get("SUPABASE_URL") ?? "",
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
//     );

//     // Get Twilio credentials from settings
//     const { data: settings, error: settingsError } = await supabaseClient
//       .from("settings")
//       .select("key, value")
//       .in("key", ["twilio_account_sid", "twilio_auth_token", "twilio_phone_number"]);

//     if (settingsError || !settings) {
//       throw new Error("Failed to fetch Twilio settings");
//     }

//     const settingsMap = settings.reduce((acc, { key, value }) => {
//       acc[key] = value;
//       return acc;
//     }, {} as Record<string, string>);

//     const twilioAccountSid = settingsMap.twilio_account_sid;
//     const twilioAuthToken = settingsMap.twilio_auth_token;
//     const twilioPhoneNumber = settingsMap.twilio_phone_number;

//     if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
//       throw new Error("Twilio credentials not configured");
//     }

//     const body: SendSmsRequest = await req.json();
//     const { customerIds, phoneNumbers, messageBody, pointsThreshold } = body;

//     if (!messageBody) {
//       throw new Error("Message body is required");
//     }

//     // Get customers to send messages to
//     let customers: any[] = [];

//     if (customerIds && customerIds.length > 0) {
//       // Send to specific customer IDs
//       const { data, error } = await supabaseClient
//         .from("customers")
//         .select("id, phone, first_name, points, opted_out")
//         .in("id", customerIds)
//         .eq("opted_out", false);

//       if (error) throw error;
//       customers = data || [];
//     } else if (phoneNumbers && phoneNumbers.length > 0) {
//       // Send to specific phone numbers
//       const { data, error } = await supabaseClient
//         .from("customers")
//         .select("id, phone, first_name, points, opted_out")
//         .in("phone", phoneNumbers)
//         .eq("opted_out", false);

//       if (error) throw error;
//       customers = data || [];
//     } else if (pointsThreshold !== undefined) {
//       // Send to customers with points >= threshold
//       const { data, error } = await supabaseClient
//         .from("customers")
//         .select("id, phone, first_name, points, opted_out")
//         .gte("points", pointsThreshold)
//         .eq("opted_out", false);

//       if (error) throw error;
//       customers = data || [];
//     } else {
//       throw new Error("Must provide customerIds, phoneNumbers, or pointsThreshold");
//     }

//     const results = [];
//     const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
//     const authHeader = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`;

//     // Send messages with rate limiting (1 message per 100ms)
//     for (const customer of customers) {
//       const personalizedMessage = messageBody
//         .replace(/\{name\}/g, customer.first_name)
//         .replace(/\{points\}/g, customer.points.toString());

//       const messageRecord: any = {
//         customer_id: customer.id,
//         phone: customer.phone,
//         message_body: personalizedMessage,
//         status: "pending",
//       };

//       try {
//         // Send SMS via Twilio
//         const formData = new URLSearchParams();
//         formData.append("To", customer.phone);
//         formData.append("From", twilioPhoneNumber);
//         formData.append("Body", personalizedMessage);

//         const response = await fetch(twilioUrl, {
//           method: "POST",
//           headers: {
//             "Authorization": authHeader,
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: formData.toString(),
//         });

//         if (response.ok) {
//           const twilioResponse = await response.json();
//           messageRecord.status = "sent";
//           messageRecord.twilio_sid = twilioResponse.sid;
//           messageRecord.sent_at = new Date().toISOString();
//           results.push({ phone: customer.phone, status: "sent" });
//         } else {
//           const errorData = await response.text();
//           messageRecord.status = "failed";
//           messageRecord.error_message = errorData;
//           results.push({ phone: customer.phone, status: "failed", error: errorData });
//         }
//       } catch (error: any) {
//         messageRecord.status = "failed";
//         messageRecord.error_message = error.message;
//         results.push({ phone: customer.phone, status: "failed", error: error.message });
//       }

//       // Save message record
//       await supabaseClient.from("messages").insert(messageRecord);

//       // Rate limiting: wait 100ms between messages
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         totalCustomers: customers.length,
//         results,
//       }),
//       {
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error: any) {
//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: error.message,
//       }),
//       {
//         status: 400,
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }
// });

/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED_ORIGIN = "https://hellskitchenwine-571619613032.us-central1.run.app";
// If you also test locally, you can temporarily use "*" or implement allowlist logic.

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  // Optional:
  "Access-Control-Max-Age": "86400"
};

interface SendSmsRequest {
  customerIds?: string[];
  phoneNumbers?: string[];
  messageBody: string;
  pointsThreshold?: number;
}

serve(async (req: Request) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST for the actual request
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in function env");
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    // Get Twilio credentials from settings table
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
    const { customerIds, phoneNumbers, messageBody, pointsThreshold } = body;

    if (!messageBody || typeof messageBody !== "string") {
      throw new Error("Message body is required");
    }

    // Get customers to message
    let customers: any[] = [];

    if (customerIds?.length) {
      const { data, error } = await supabaseClient
        .from("customers")
        .select("id, phone, first_name, points, opted_out")
        .in("id", customerIds)
        .eq("opted_out", false);

      if (error) throw error;
      customers = data ?? [];
    } else if (phoneNumbers?.length) {
      const { data, error } = await supabaseClient
        .from("customers")
        .select("id, phone, first_name, points, opted_out")
        .in("phone", phoneNumbers)
        .eq("opted_out", false);

      if (error) throw error;
      customers = data ?? [];
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

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const authHeader = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`;

    for (const customer of customers) {
      const personalizedMessage = messageBody
        .replace(/\{name\}/g, String(customer.first_name ?? ""))
        .replace(/\{points\}/g, String(customer.points ?? ""));

      const messageRecord: any = {
        customer_id: customer.id,
        phone: customer.phone,
        message_body: personalizedMessage,
        status: "pending"
      };

      try {
        const formData = new URLSearchParams();
        formData.append("To", customer.phone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", personalizedMessage);

        const resp = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });

        if (resp.ok) {
          const twilioResp = await resp.json();
          messageRecord.status = "sent";
          messageRecord.twilio_sid = twilioResp.sid;
          messageRecord.sent_at = new Date().toISOString();
          results.push({ phone: customer.phone, status: "sent" });
        } else {
          const errorText = await resp.text();
          messageRecord.status = "failed";
          messageRecord.error_message = errorText;
          results.push({ phone: customer.phone, status: "failed", error: errorText });
        }
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        messageRecord.status = "failed";
        messageRecord.error_message = msg;
        results.push({ phone: customer.phone, status: "failed", error: msg });
      }

      // Save message record (don’t block the response if this fails)
      await supabaseClient.from("messages").insert(messageRecord);

      // Rate limit
      await new Promise((r) => setTimeout(r, 100));
    }

    return new Response(
      JSON.stringify({ success: true, totalCustomers: customers.length, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message ?? String(err) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
