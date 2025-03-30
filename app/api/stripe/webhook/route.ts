import {
  createUser,
  getUser,
  getUserByStripeCustomerId,
  updateUser,
} from "@/db/queries";
import { stripe } from "@/lib/billing/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json(
      {
        error: "Webhook signature verification failed.",
      },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Payment is successful
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const checkoutUserId = checkoutSession.client_reference_id!;
      const checkoutCustomerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer!.id;
      const checkoutSubscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription!.id;

      const user = await getUser(checkoutUserId);
      if (!user) {
        // Create the user if it doesn't exist
        createUser({
          id: checkoutUserId,
          stripeCustomerId: checkoutCustomerId,
          stripeSubscriptionId: checkoutSubscriptionId,
        });
      } else {
        updateUser(checkoutUserId, {
          stripeCustomerId: checkoutCustomerId,
          stripeSubscriptionId: checkoutSubscriptionId,
        });
      }

      break;

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Handle subscription status changes
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionCustomerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer!.id;
      const subscriptionStatus = subscription.status;

      const userFromDb = await getUserByStripeCustomerId(
        subscriptionCustomerId,
      );

      updateUser(userFromDb.id, {
        planName: subscriptionStatus === "active" ? "pro" : "free",
        stripeCustomerId: subscriptionCustomerId,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscriptionStatus,
      });
      break;
  }

  return NextResponse.json({ received: true });
}
