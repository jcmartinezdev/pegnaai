import { auth0 } from "@/lib/auth0";
import { z } from "zod";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {});
const priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
const appBaseUrl = process.env.APP_BASE_URL;

const checkoutCreateSchema = z.object({
  returnTo: z.string().optional().default(`${appBaseUrl}/settings/billing`),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { success, data, error } = checkoutCreateSchema.safeParse(body);
  if (!success) {
    console.log("Invalid request", error);
    return new Response(
      JSON.stringify({ message: "Invalid request", type: "invalid_request" }),
      { status: 400 },
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
        type: "authorization_error",
      }),
      { status: 401 },
    );
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: session.user.email,
    success_url: data.returnTo,
    cancel_url: data.returnTo,
  });

  if (!checkoutSession.url) {
    return new Response(
      JSON.stringify({
        message: "Failed to create checkout session",
        type: "checkout_error",
      }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      redirectTo: checkoutSession.url,
    }),
    { status: 200 },
  );
}
