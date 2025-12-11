import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productsAPI, productLikesAPI } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Star,
  CheckCircle,
  Truck,
  Shield,
  Gauge,
  Zap,
  Camera,
  Battery,
  ShoppingCartIcon,
  Heart,
  Share2,
  FileDown,
  PlayCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";

interface Product {
  _id: string;
  productId: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  priceValue: number;
  image: string;
  category: string;
  specifications: {
    speed?: string;
    payload?: string;
    range?: string;
    battery?: string;
  };
  features: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  shippingTime: string;
  warranty: string;
  datasheetUrl?: string;
  demoUrl?: string;
  technicalDetails?: {
    motors?: string[];
    sensors?: string[];
    compute?: string[];
    battery?: string;
    comms?: string[];
    useCases?: string[];
  };
}

const fallbackTechnicalDetails: Record<string, Product["technicalDetails"]> = {
  exploration: {
    motors: ["4x BLDC hub motors, 250W each", "Integrated motor drivers"],
    sensors: ["360° LiDAR", "Stereo depth camera", "IMU & wheel encoders"],
    compute: ["NVIDIA Jetson Xavier NX", "ROS2 Foxy stack"],
    battery: "48V 20Ah swappable Li-ion (3 hrs mixed duty)",
    comms: ["Dual-band Wi‑Fi", "4G/LTE fallback", "RTK GPS ready"],
    useCases: ["Terrain mapping", "Search & inspection", "Outdoor patrol"],
  },
  industrial: {
    motors: ["4x planetary geared motors, 320W", "Closed-loop motor control"],
    sensors: ["2D safety LiDAR", "RGB-D for pallet detection", "IMU"],
    compute: ["Industrial PC (i7) + GPU", "ROS2 Humble, PLC bridge"],
    battery: "48V 25Ah Li-ion with hot-swap (6 hrs floor ops)",
    comms: ["Ethernet", "Wi‑Fi 6", "Modbus/TCP bridge"],
    useCases: ["Intralogistics", "Line-side delivery", "Inspection"],
  },
  ai: {
    motors: ["4x BLDC 200W", "FOC motor drivers"],
    sensors: ["4K RGB camera", "Depth camera", "Mic array"],
    compute: ["Jetson Orin Nano", "TensorRT runtime"],
    battery: "42V 18Ah Li-ion (3.5 hrs AI workload)",
    comms: ["Wi‑Fi 6E", "BLE", "WebRTC streaming"],
    useCases: ["Human-robot interaction", "Telepresence", "Research"],
  },
  default: {
    motors: ["High-torque BLDC drive", "Closed-loop control"],
    sensors: ["Depth camera", "IMU", "Ultrasonic / LiDAR (model-dependent)"],
    compute: ["Edge GPU computer", "ROS2 middleware"],
    battery: "High-capacity Li-ion pack",
    comms: ["Wi‑Fi / LTE", "Cloud dashboard"],
    useCases: ["R&D", "Education", "Custom integration"],
  },
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  // Fetch product by MongoDB _id
  const { data: product, isLoading, isError, error } = useQuery<Product, Error>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Product ID is missing.");
      }
      const response = await productsAPI.getProductByMongoId(id);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch product.");
      }
    },
    enabled: !!id,
  });

  // Fetch like count
  useEffect(() => {
    if (product?._id) {
      productLikesAPI
        .getLikeCount(product._id)
        .then((response) => {
          if (response.data.success) {
            setLikeCount(response.data.data.likeCount);
          }
        })
        .catch((err) => {
          console.error("Error fetching like count:", err);
        });

      // Fetch like status if user is authenticated
      if (isAuthenticated) {
        productLikesAPI
          .getLikeStatus(product._id)
          .then((response) => {
            if (response.data.success) {
              setIsLiked(response.data.data.isLiked);
            }
          })
          .catch((err) => {
            console.error("Error fetching like status:", err);
          });
      }
    }
  }, [product?._id, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to like products");
      navigate("/auth");
      return;
    }

    if (!product?._id) return;

    setLoadingLike(true);
    try {
      const response = await productLikesAPI.toggleLike(product._id);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
        setLikeCount(response.data.data.likeCount);
        toast.success(
          response.data.data.isLiked
            ? "Product liked!"
            : "Product unliked!"
        );
      }
    } catch (err: any) {
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to toggle like");
    } finally {
      setLoadingLike(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const addToCart = () => {
    if (!product) return;
    addItem({
      id: product.productId,
      name: product.name,
      price: product.price,
      priceValue: product.priceValue,
      image: product.image,
      specifications: product.specifications,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price: string | number) => {
    // If price is a string, try to extract numeric value and format as INR
    if (typeof price === "string") {
      const numericValue = parseFloat(price.replace(/[₹$,]/g, "")) || 0;
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(numericValue);
    }
    // If price is a number, format as INR
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const SpecBadge = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (isError) {
    useEffect(() => {
      toast.error(error?.message || "Failed to load product. It might not exist.");
      navigate("/products");
    }, [error, navigate]);
    return null;
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const techDetails =
    product.technicalDetails ||
    fallbackTechnicalDetails[product.category?.toLowerCase()] ||
    fallbackTechnicalDetails.default;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-6 gap-2 hover:bg-muted transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-card to-card/50 sticky top-8">
            <CardHeader className="p-0">
              <div className="w-full aspect-square bg-gradient-to-br from-muted/40 via-primary/10 to-secondary/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                {product.image &&
                (product.image.startsWith("http") ||
                  product.image.startsWith("https")) ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-8"
                  />
                ) : (
                  <div className="text-6xl">{product.image || "🤖"}</div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
                  </div>
                )}
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg">
                    {product.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Product Details */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between mb-6">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleLike}
                    disabled={loadingLike}
                    className="h-10 w-10 rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isLiked
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-muted-foreground hover:text-red-500"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all"
                  >
                    <Share2 className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>

              <CardTitle className="text-3xl lg:text-4xl font-semibold mb-4 text-foreground">
                {product.name}
              </CardTitle>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-3 py-1.5 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-foreground">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({product.reviews} reviews)
                  </span>
                  {likeCount > 0 && (
                    <span className="text-muted-foreground text-sm">
                      • {likeCount} {likeCount === 1 ? "like" : "likes"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {formatPrice(product.priceValue)}
                </div>
                {product.originalPrice && (
                  <div className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>

              <CardDescription className="text-base leading-relaxed mb-8 text-muted-foreground">
                {product.description}
              </CardDescription>

              {/* Stock & Shipping Info */}
              <div className="grid grid-cols-1 gap-3 mb-6 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {product.inStock
                      ? `In Stock (${product.stockCount} available)`
                      : "Currently unavailable"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Ships in {product.shippingTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>{product.warranty}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Speed</p>
                    <p className="text-sm font-bold text-foreground">{product.specifications.speed || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Payload</p>
                    <p className="text-sm font-bold text-foreground">{product.specifications.payload || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Range</p>
                    <p className="text-sm font-bold text-foreground">{product.specifications.range || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Battery className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Battery</p>
                    <p className="text-sm font-bold text-foreground">{product.specifications.battery || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="p-6 border-2 border-border rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-xl text-foreground">Technical Details</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Motors & Drive
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {techDetails?.motors?.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Sensors
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {techDetails?.sensors?.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Compute
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {techDetails?.compute?.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Connectivity
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {techDetails?.comms?.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Battery
                    </p>
                    <p className="text-muted-foreground">{techDetails?.battery}</p>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-background/60 border border-border/50">
                    <p className="font-bold text-foreground text-base flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Use Cases
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {techDetails?.useCases?.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Key Features
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group"
                    >
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <Button
                  className="w-full gap-2 text-lg h-14 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  onClick={addToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link to={product.demoUrl || "/controller"}>
                    <Button variant="outline" className="w-full gap-2 h-11 font-semibold border-2 hover:bg-muted transition-all hover:scale-105">
                      <PlayCircle className="w-4 h-4" />
                      View Demo
                    </Button>
                  </Link>
                  <a
                    href={product.datasheetUrl || "/contact"}
                    target={product.datasheetUrl ? "_blank" : undefined}
                    rel={product.datasheetUrl ? "noreferrer" : undefined}
                  >
                    <Button variant="outline" className="w-full gap-2 h-11 font-semibold border-2 hover:bg-muted transition-all hover:scale-105">
                      <FileDown className="w-4 h-4" />
                      {product.datasheetUrl ? "Download Datasheet" : "Request Datasheet"}
                    </Button>
                  </a>
                </div>
                <Link to="/contact">
                  <Button variant="ghost" className="w-full gap-2 h-11 font-semibold hover:bg-primary/10 hover:text-primary transition-all">
                    <MessageSquare className="w-4 h-4" />
                    Contact for Custom Robotics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

