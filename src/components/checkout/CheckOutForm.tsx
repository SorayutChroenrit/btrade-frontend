"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export const goToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;

  if (stripe && sessionId) {
    await stripe.redirectToCheckout({ sessionId });
  } else {
    console.error("Stripe initialization or session ID missing");
  }
};

const CheckoutButton = () => {
  return (
    <Button onClick={goToCheckout} type="button">
      Submit
    </Button>
  );
};

export default CheckoutButton;
