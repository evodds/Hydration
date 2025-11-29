import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { db } from "./index";

// NOTE: In production, load these from environment variables and never commit keys.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "YOUR_STRIPE_SECRET_KEY";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "YOUR_STRIPE_WEBHOOK_SECRET";

// Explicit apiVersion to satisfy Stripe types
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const router = Router();

// --- Create Checkout Session ---
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const { userId, priceId } = req.body as { userId?: string; priceId?: string };

  if (!userId || !priceId) {
    return res.status(400).send({ error: "userId and priceId are required" });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { appUserId: userId },
      });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
    } catch (error) {
      console.error("Failed to create Stripe customer:", error);
      return res.status(500).send({ error: "Failed to create Stripe customer" });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: `http://localhost:5173/plans?success=true`,
      cancel_url: `http://localhost:5173/plans?cancel=true`,
    });

    if (!session.url) {
      return res.status(500).send({ error: "Stripe session URL is null" });
    }

    return res.send({ url: session.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return res.status(500).send({ error: "Failed to create checkout session" });
  }
});

// --- Stripe Webhook ---
router.post("/webhook", (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.log("❌ Webhook signature verification failed.", err.message);
    return res.sendStatus(400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const stripeCustomerId = session.customer as string;

      if (!userId) {
        console.error("Webhook Error: Missing client_reference_id (userId) in checkout session.");
        break;
      }

      const user = db.users.find((u) => u.id === userId);
      if (user) {
        user.tier = "pro";
        user.stripeCustomerId = stripeCustomerId;
        console.log(`✅ User ${userId} successfully upgraded to Pro.`);
      } else {
        console.error(`Webhook Error: User not found for userId ${userId}`);
      }
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const userToUpdate = db.users.find((u) => u.stripeCustomerId === customerId);

      if (userToUpdate) {
        if (subscription.status === "active") {
          userToUpdate.tier = "pro";
        } else {
          userToUpdate.tier = "free";
        }
        console.log(`ℹ️ User ${userToUpdate.id} tier updated to ${userToUpdate.tier}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.send({ received: true });
});

export default router;
