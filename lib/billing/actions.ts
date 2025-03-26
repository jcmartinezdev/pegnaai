"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/billing/stripe";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionResponse } from "./types";
import { getUser } from "@/db/queries";

/**
 * Starts the checkout flow for a subscription
 *
 * @param returnTo - The URL to return to after the checkout flow is complete
 */
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

  const successUrl = new URL(`${appBaseUrl}${returnTo}`);
  successUrl.searchParams.append("success", "true");

  const cancelUrl = new URL(`${appBaseUrl}${returnTo}`);
  cancelUrl.searchParams.append("canceled", "true");

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.user.sub))
    .limit(1);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: user[0]?.stripeCustomerId ? undefined : session.user.email,
    customer: user[0]?.stripeCustomerId || undefined,
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

/**
 * Navigates the user to the customer portal
 */
export async function openCustomerPortal() {
  const session = await auth0.getSession();

  if (!session) {
    return {
      success: false,
      error: "No session found",
    };
  }

  const user = await getUser(session.user.sub);

  if (!user || !user.stripeCustomerId) {
    return {
      success: false,
      error: "No stripe customer found",
    };
  }

  const configuration = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.APP_BASE_URL}/settings/account`,
  });

  if (!configuration.url) {
    return {
      success: false,
      error: "Failed to create billing portal session",
    };
  }

  redirect(configuration.url);
}
