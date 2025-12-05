import mongoose from "mongoose";

// Define the Mongoose schema for an Order
const orderSchema = new mongoose.Schema(
  {
    // Order Information
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },

    // Customer Information
    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Optional for guest checkout
      },
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Shipping Address
    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },

    // Order Items
    items: [
      {
        productId: {
          type: Number,
          required: true,
        },
        productMongoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        priceValue: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
        },
        specifications: {
          speed: String,
          payload: String,
          range: String,
          battery: String,
        },
      },
    ],

    // Payment Information
    payment: {
      razorpayOrderId: {
        type: String,
        required: true,
      },
      razorpayPaymentId: {
        type: String,
        required: true,
      },
      razorpaySignature: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "INR",
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      method: {
        type: String,
        default: "razorpay",
      },
    },

    // Order Totals
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },

    // Additional Information
    notes: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for efficient queries
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ "customer.userId": 1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

// Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    // Generate order number: ORD-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${dateStr}-${randomStr}`;
  }
  next();
});

// Create and export the Order model
const Order = mongoose.model("Order", orderSchema);
export default Order;



