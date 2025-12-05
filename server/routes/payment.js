import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error("Missing Razorpay keys in .env");
    return res.status(500).json({ error: "Missing Razorpay keys" });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    console.error("Invalid amount:", amount);
    return res.status(400).json({ error: "Invalid amount" });
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  const amountInPaise = Math.round(Number(amount) * 100);
  console.log(`💰 Creating Razorpay order for ₹${amount} = ${amountInPaise} paise`);

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order.id);
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error creating order:", err.message);
    return res.status(500).json({ success: false, error: err.message || "Failed to create order" });
  }
});

router.post("/verify", authenticateToken, async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    items,
    customer,
    shippingAddress,
    subtotal,
    shipping,
    tax,
    total
  } = req.body;

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error("Missing fields in verification payload");
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Order items are required" });
  }

  if (!customer || !shippingAddress) {
    return res.status(400).json({ success: false, error: "Customer and shipping address are required" });
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔍 Comparing signatures:");
    console.log("Expected:", generatedSignature);
    console.log("Received:", razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      console.log("Payment verified successfully for order:", razorpay_order_id);
      
      // Create order in database
      const orderData = {
        customer: {
          userId: req.userId || req.user?._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || "India",
        },
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          priceValue: item.priceValue,
          quantity: item.quantity,
          image: item.image,
          specifications: item.specifications,
        })),
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: total || subtotal,
          currency: "INR",
          status: "completed",
          method: "razorpay",
        },
        subtotal: subtotal || 0,
        shipping: shipping || 0,
        tax: tax || 0,
        total: total || subtotal || 0,
        status: "processing",
      };

      const order = new Order(orderData);
      await order.save();

      console.log("Order saved successfully:", order.orderNumber);

      return res.status(200).json({ 
        success: true,
        message: "Payment verified and order created successfully",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
        }
      });
    } else {
      console.warn("Signature mismatch");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err.message);
    return res.status(500).json({ success: false, error: err.message || "Verification failed" });
  }
});

// GET /orders - Get all orders (Admin only)
router.get("/orders", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin access required" 
      });
    }

    const { status, paymentStatus, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query["payment.status"] = paymentStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("customer.userId", "firstName lastName email")
      .populate("items.productMongoId", "name image price");

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      message: "Orders fetched successfully!",
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
});

// GET /orders/:orderId - Get a single order (Admin only)
router.get("/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin access required" 
      });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("customer.userId", "firstName lastName email phone")
      .populate("items.productMongoId", "name image price description");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found." 
      });
    }

    res.json({
      success: true,
      message: "Order fetched successfully!",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch order", 
      error: error.message 
    });
  }
});

// PUT /orders/:orderId/status - Update order status (Admin only)
router.put("/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin access required" 
      });
    }

    const { orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const updateData = { status };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("customer.userId", "firstName lastName email")
      .populate("items.productMongoId", "name image price");

    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found." 
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully!",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update order status", 
      error: error.message 
    });
  }
});

export default router;