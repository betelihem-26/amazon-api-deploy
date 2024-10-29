const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_KEY);

// Check if Stripe API key is loaded
if (!process.env.STRIPE_KEY) {
  throw new Error(
    "Stripe API key is missing. Set STRIPE_KEY in your .env file."
  );
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success!",
  });
});

// POST route to handle payment creation
app.post("/payment/create", async (req, res) => {
  try {
    const total = parseInt(req.query.total);

    // Check if total is valid
    if (total && total > 0) {
      console.log("Payment received:", total);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total, // amount in cents
        currency: "usd",
      });

      // Respond with client secret
      res.status(201).json({
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      // If total is invalid, return an error response
      res.status(400).json({ error: "Total must be greater than 0" });
    }
  } catch (error) {
    // Handle Stripe or server errors
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
});

// Start the server
app.listen(5001, (err) => {
  if (err) throw err;
  console.log("Amazon Server Running on PORT: 5001, http://localhost:5001");
});
