import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Products.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

const professionalProducts = [
  {
    productId: 1,
    name: "RoboTech Explorer Pro",
    category: "exploration",
    price: "₹12,99,000",
    priceValue: 1299000,
    originalPrice: "₹15,99,000",
    rating: 4.8,
    reviews: 324,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    description: "Advanced 4WD exploration robot with AI-powered autonomous navigation, SLAM-based mapping, and real-time environmental analysis. Perfect for terrain mapping, search & rescue, and outdoor research applications.",
    features: [
      "360° LiDAR Mapping with SLAM",
      "AI-Powered Obstacle Avoidance",
      "12-Hour Battery Life",
      "Weather Resistant IP67",
      "Real-time Data Streaming",
      "RTK GPS Integration",
      "Modular Sensor Mounts",
    ],
    specifications: {
      speed: "5 m/s max",
      payload: "15 kg",
      range: "10 km autonomous",
      battery: "48V 20Ah Li-ion",
    },
    technicalDetails: {
      motors: ["4x BLDC hub motors, 250W each", "Integrated motor drivers with FOC control"],
      sensors: ["360° LiDAR (Velodyne VLP-16)", "Stereo depth camera (Intel RealSense D435)", "IMU & wheel encoders", "RTK GPS module"],
      compute: ["NVIDIA Jetson Xavier NX", "ROS2 Foxy stack", "8GB RAM"],
      battery: "48V 20Ah swappable Li-ion (3 hrs mixed duty, 12 hrs standby)",
      comms: ["Dual-band Wi‑Fi 6", "4G/LTE fallback", "Ethernet port"],
      useCases: ["Terrain mapping", "Search & inspection", "Outdoor patrol", "Research expeditions"],
    },
    inStock: true,
    stockCount: 12,
    shippingTime: "2-3 days",
    warranty: "2 years warranty included",
    datasheetUrl: "https://drive.google.com/uc?export=download&id=1Zt-explorer-pro-datasheet",
    demoUrl: "/controller",
  },
  {
    productId: 2,
    name: "Industrial Titan X1",
    category: "industrial",
    price: "₹24,99,000",
    priceValue: 2499000,
    originalPrice: "₹29,99,000",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&auto=format",
    description: "Heavy-duty 4WD industrial robot designed for manufacturing environments with precision control, safety monitoring, and seamless integration with existing production lines. Built for 24/7 operation.",
    features: [
      "50kg Payload Capacity",
      "Precision Actuators (±0.1mm)",
      "Safety Monitoring System",
      "Integration APIs (REST/Modbus)",
      "24/7 Operation Ready",
      "Hot-swappable Battery",
      "Collision Avoidance",
    ],
    specifications: {
      speed: "3 m/s max",
      payload: "50 kg",
      range: "Unlimited (wired option)",
      battery: "48V 25Ah Li-ion (6 hrs)",
    },
    technicalDetails: {
      motors: ["4x planetary geared motors, 320W", "Closed-loop motor control", "High-torque output"],
      sensors: ["2D safety LiDAR (SICK S300)", "RGB-D for pallet detection (Intel RealSense)", "IMU", "Wheel encoders"],
      compute: ["Industrial PC (Intel i7) + GPU", "ROS2 Humble", "PLC bridge module"],
      battery: "48V 25Ah Li-ion with hot-swap (6 hrs floor ops)",
      comms: ["Ethernet Gigabit", "Wi‑Fi 6", "Modbus/TCP bridge", "CAN bus"],
      useCases: ["Intralogistics", "Line-side delivery", "Inspection", "Material handling"],
    },
    inStock: true,
    stockCount: 8,
    shippingTime: "5-7 days",
    warranty: "3 years warranty included",
    datasheetUrl: "https://drive.google.com/uc?export=download&id=1Zt-industrial-titan-datasheet",
    demoUrl: "/controller",
  },
  {
    productId: 3,
    name: "Swift Scout V2",
    category: "surveillance",
    price: "₹8,99,000",
    priceValue: 899000,
    originalPrice: "₹9,99,000",
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    description: "Compact 4WD surveillance robot with advanced camera systems, AI-powered threat detection, and silent operation. Ideal for perimeter security, indoor monitoring, and event surveillance.",
    features: [
      "4K Night Vision Camera",
      "Silent Operation (<30dB)",
      "AI Motion Detection",
      "Remote Control Interface",
      "Cloud Recording",
      "PTZ Camera Control",
      "Thermal Imaging Option",
    ],
    specifications: {
      speed: "8 m/s max",
      payload: "5 kg",
      range: "5 km",
      battery: "8 hours continuous",
    },
    technicalDetails: {
      motors: ["4x BLDC 150W", "Quiet operation mode"],
      sensors: ["4K RGB camera (Sony IMX678)", "Thermal camera (FLIR Lepton)", "360° LiDAR", "Microphone array"],
      compute: ["Jetson Nano", "Edge AI inference", "TensorRT optimized"],
      battery: "42V 15Ah Li-ion (8 hrs continuous, 12 hrs standby)",
      comms: ["Wi‑Fi 6E", "4G/LTE", "BLE", "Cloud API"],
      useCases: ["Perimeter security", "Indoor monitoring", "Event surveillance", "Crowd management"],
    },
    inStock: true,
    stockCount: 15,
    shippingTime: "1-2 days",
    warranty: "1 year warranty included",
    datasheetUrl: "https://drive.google.com/uc?export=download&id=1Zt-swift-scout-datasheet",
    demoUrl: "/controller",
  },
  {
    productId: 4,
    name: "Research Rover Alpha",
    category: "research",
    price: "₹18,99,000",
    priceValue: 1899000,
    originalPrice: "₹21,99,000",
    rating: 4.6,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&auto=format",
    description: "Scientific 4WD research robot equipped with modular sensor arrays, precise positioning, and comprehensive data collection systems. Designed for laboratory environments and field research.",
    features: [
      "Modular Sensor Arrays",
      "Precise Data Logging",
      "Sterile Operation Mode",
      "Sub-millimeter Positioning",
      "Remote Monitoring",
      "Open-source SDK",
      "Multi-sensor Fusion",
    ],
    specifications: {
      speed: "2 m/s max",
      payload: "20 kg",
      range: "Indoor/Outdoor",
      battery: "16 hours",
    },
    technicalDetails: {
      motors: ["4x precision BLDC", "Encoder feedback", "Low-vibration design"],
      sensors: ["Modular sensor mounts", "Depth camera", "IMU", "Laser rangefinder", "Environmental sensors"],
      compute: ["Jetson Orin Nano", "ROS2", "Data logging system"],
      battery: "48V 18Ah Li-ion (16 hrs research mode)",
      comms: ["Wi‑Fi 6", "Ethernet", "USB-C", "SD card logging"],
      useCases: ["Laboratory automation", "Field research", "Data collection", "Educational research"],
    },
    inStock: true,
    stockCount: 5,
    shippingTime: "3-5 days",
    warranty: "2 years warranty included",
    datasheetUrl: "https://drive.google.com/uc?export=download&id=1Zt-research-rover-datasheet",
    demoUrl: "/controller",
  },
  {
    productId: 5,
    name: "Autonomous Delivery Bot",
    category: "exploration",
    price: "₹15,99,000",
    priceValue: 1599000,
    originalPrice: "₹18,99,000",
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format",
    description: "Last-mile delivery robot with dynamic obstacle avoidance, secure package handling, and cloud-connected fleet management. Optimized for urban environments and campus deliveries.",
    features: [
      "Secure Package Compartment",
      "Dynamic Obstacle Avoidance",
      "Fleet Management System",
      "Weather Resistant",
      "Customer Notification",
      "GPS Tracking",
      "Multi-drop Capability",
    ],
    specifications: {
      speed: "6 m/s max",
      payload: "30 kg",
      range: "15 km",
      battery: "10 hours",
    },
    technicalDetails: {
      motors: ["4x BLDC hub motors, 300W", "Regenerative braking"],
      sensors: ["360° LiDAR", "RGB-D camera", "IMU", "GPS", "Ultrasonic sensors"],
      compute: ["Jetson Xavier NX", "ROS2", "Cloud connectivity"],
      battery: "48V 22Ah Li-ion (10 hrs delivery mode)",
      comms: ["Wi‑Fi 6", "4G/LTE", "Cloud API", "Customer app integration"],
      useCases: ["Last-mile delivery", "Campus logistics", "Food delivery", "Package distribution"],
    },
    inStock: true,
    stockCount: 20,
    shippingTime: "3-4 days",
    warranty: "2 years warranty included",
    datasheetUrl: "https://drive.google.com/uc?export=download&id=1Zt-delivery-bot-datasheet",
    demoUrl: "/controller",
  },
];

const seedProfessionalProducts = async () => {
  try {
    console.log("📦 Starting professional product database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});

    // Create new products
    console.log("🤖 Creating professional products...");
    const createdProducts = await Product.create(professionalProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n📋 Seeding completed for the following products:");
    createdProducts.forEach((product) => {
      console.log(`   ✓ ID: ${product.productId}, Name: ${product.name}, Category: ${product.category}, Price: ${product.price}`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
    console.log("🎉 Professional product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Product seeding failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProfessionalProducts();
}

export default seedProfessionalProducts;

