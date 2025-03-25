"use server";

import { auth0 } from "@/lib/auth0";
import { ActionResponse } from "./base";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

export async function startCheckoutFlow({
  returnTo,
}: {
  returnTo: string;
}): Promise<ActionResponse<string>> {
  const session = await auth0.getSession();

  if (!session) {
    return {
      success: false,
      error: "No session found",
    };
  }
  const priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
  const appBaseUrl = process.env.APP_BASE_URL;

  const successUrl = new URL(`${appBaseUrl}/checkout/success`);
  successUrl.searchParams.append("success", "true");
  successUrl.searchParams.append("returnTo", returnTo);
  successUrl.searchParams.append("checkoutSessionId", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(`${appBaseUrl}${returnTo}`);
  cancelUrl.searchParams.append("canceled", "true");

  //FIXME: find if the user is an existing stripe customer
  // if it is, then pass the customer id to the checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: session.user.email,
    client_reference_id: session.user.sub,
    success_url: successUrl.href,
    cancel_url: cancelUrl.href,
  });

  if (!checkoutSession.url) {
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }

  redirect(checkoutSession.url);
}
