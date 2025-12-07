import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received verification request:", JSON.stringify(body));

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !eventId) {
      console.error("Missing fields:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId });
      return new Response(
        JSON.stringify({ error: "Missing required fields", details: { razorpay_order_id: !!razorpay_order_id, razorpay_payment_id: !!razorpay_payment_id, razorpay_signature: !!razorpay_signature, eventId: !!eventId } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No auth header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature using Web Crypto API
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const msgData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    console.log("Signature check - Expected:", expectedSignature.substring(0, 20) + "...", "Received:", razorpay_signature.substring(0, 20) + "...");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch");
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment signature verified successfully");

    // Update registration status using service role
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First check if registration exists
    const { data: existingReg, error: checkError } = await serviceClient
      .from("event_registrations")
      .select("id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (checkError) {
      console.error("Error finding registration:", checkError);
      return new Response(
        JSON.stringify({ error: "Registration not found", details: checkError.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found registration:", existingReg);

    // Update the registration
    const { data: updateData, error: updateError } = await serviceClient
      .from("event_registrations")
      .update({
        status: "confirmed",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select();

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm registration", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Registration updated successfully:", updateData);

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and registration confirmed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
