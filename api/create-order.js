import Razorpay from "razorpay";

// Initialize Razorpay instance outside the handler
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency } = req.body;

    // 1. Prepare Order Options
    const orderOptions = {
      amount: Math.round(amount * 100), // Amount in the smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // 2. Create the Order
    const order = await instance.orders.create(orderOptions);
    console.log("Razorpay Order Created:", order);

    if (!order) {
      return res.status(500).json({ error: "Razorpay order creation failed" });
    }

    // 3. Prepare Payment Link Options
    const linkOptions = {
      // Amount and currency are inherited from the order_id, do not add them here
      description: "Payment for Print Service",
      customer: {
        name: "Print Service Customer", // You can customize this
      },
      notes: {
        order_id: order.id,
      },
    };

    // 4. Create the Payment Link for the Order
    // The SDK automatically knows to associate the link with the order
    const paymentLink = await instance.paymentLink.create({
      ...linkOptions,
      // We manually attach the order to the link by setting its amount and currency
      // to the order's values, and then passing the order_id in notes for reference.
      // This is a robust way to ensure association.
      amount: order.amount,
      currency: order.currency,
      notes: {
          order_id: order.id
      }
    });

    // A different, simpler way if the above is complex:
    // Some versions of the API/SDK allow passing order_id directly, but it can be tricky.
    // Let's create a link and pass the order in the notes for tracking.
    // const paymentLink = await instance.paymentLink.create({
    //   amount: order.amount,
    //   currency: order.currency,
    //   description: "Payment for Print Service",
    //   notes: {
    //     order_id: order.id,
    //   },
    // });


    console.log("Razorpay Payment Link Created:", paymentLink);
    res.status(200).json(paymentLink);

  } catch (err) {
    console.error("Razorpay SDK Error:", err);
    // The SDK provides more detailed errors
    res.status(err.statusCode || 500).json({
      error: "Failed to create order or payment link",
      details: err.error,
    });
  }
}
