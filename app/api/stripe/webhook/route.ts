import {
  createUser,
  getUser,
  getUserByStripeCustomerId,
  updateUser,
} from "@/db/queries";
import { stripe } from "@/lib/billing/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";

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

  console.log("Webhook event received:", event.type);

  try {
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

        console.log("Checkout session completed:", {
          checkoutUserId,
          checkoutCustomerId,
          checkoutSubscriptionId,
        });

        const user = await getUser(checkoutUserId);
        if (!user) {
          // Create the user if it doesn't exist
          await createUser({
            id: checkoutUserId,
            stripeCustomerId: checkoutCustomerId,
            stripeSubscriptionId: checkoutSubscriptionId,
          });
        } else {
          await updateUser(checkoutUserId, {
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

        console.log("Subscription updated/deleted:", {
          userFromDb: userFromDb?.id,
          stripeCustomerId: subscriptionCustomerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscriptionStatus,
        });

        // Only update the plan if the subscription is canceled or active
        // Ignore other statuses like "incomplete", "past_due", etc.
        // As they shouldn't trigger a plan change
        if (
          subscriptionStatus === "canceled" ||
          subscriptionStatus === "active"
        ) {
          await updateUser(userFromDb.id, {
            planName: subscriptionStatus === "active" ? "pro" : "free",
            stripeCustomerId: subscriptionCustomerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscriptionStatus,
          });
        } else {
          await updateUser(userFromDb.id, {
            stripeCustomerId: subscriptionCustomerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscriptionStatus,
          });
        }
        break;
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Error handling webhook event" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
