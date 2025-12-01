import { Router, Request, Response } from "express";
import twilio from "twilio";
import { db } from "./index";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "YOUR_TWILIO_ACCOUNT_SID";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "YOUR_TWILIO_AUTH_TOKEN";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "YOUR_TWILIO_PHONE_NUMBER";

const client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

const router = Router();

router.patch("/user/:userId/phone", (req: Request, res: Response) => {
  const { userId } = req.params;
  const { phone } = req.body as { phone?: string };

  if (!phone) {
    return res.status(400).send({ error: "Phone number is required" });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  if (user.tier !== "pro") {
    return res.status(403).send({ error: "SMS features are only available to Pro users." });
  }

  user.phone = phone;
  console.log(`Updated phone for user ${userId}`);
  return res.send(user);
});

router.post("/user/:userId/send-test", async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!client) {
    console.error("Twilio client not initialized. Check environment variables.");
    return res.status(500).send({ error: "SMS service is not configured." });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  if (user.tier !== "pro") {
    return res.status(403).send({ error: "SMS features are only available to Pro users." });
  }

  if (!user.phone) {
    return res.status(400).send({ error: "User has no phone number on file." });
  }

  try {
    const message = await client.messages.create({
      body: "This is a test message from Hydration Habit Ping! 💧",
      from: TWILIO_PHONE_NUMBER,
      to: user.phone,
    });

    console.log(`Test SMS sent to ${user.phone}, SID: ${message.sid}`);
    return res.send({ success: true, message: `Test message sent to ${user.phone}` });
  } catch (error: any) {
    console.error("Failed to send test SMS:", error.message);
    return res.status(500).send({ error: "Failed to send test SMS.", details: error.message });
  }
});

export default router;
