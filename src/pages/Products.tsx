import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import ShoppingCartComponent from "@/components/ShoppingCart"; // Renamed to avoid conflict
import { productsAPI, productLikesAPI } from "@/services/api";
import { Loader2, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import {
  Bot,
  Cpu,
  Battery,
  Gauge,
  Shield,
  Camera,
  ArrowRight,
  Star,
  Zap,
  CheckCircle,
  Filter,
  ShoppingCartIcon,
  Heart,
  Share2,
  Truck,
//  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

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
}

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuth();
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getProducts();
        if (response.data.success) {
          setProducts(response.data.data || []);
        } else {
          setError("Failed to load products");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch like counts and status for all products
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(async (product) => {
        try {
          const response = await productLikesAPI.getLikeCount(product._id);
          if (response.data.success) {
            setLikeCounts((prev) => ({
              ...prev,
              [product._id]: response.data.data.likeCount,
            }));
          }

          if (isAuthenticated) {
            const statusResponse = await productLikesAPI.getLikeStatus(product._id);
            if (statusResponse.data.success && statusResponse.data.data.isLiked) {
              setLikedProducts((prev) => new Set(prev).add(product._id));
            }
          }
        } catch (err) {
          console.error(`Error fetching like data for product ${product._id}:`, err);
        }
      });
    }
  }, [products, isAuthenticated]);

  // Transform products to match the expected format
  const robots = products.map((product) => {
    // Extract numeric price from string (e.g., "$12,999" -> 12999)
    const priceNum = product.priceValue || 0;
    const originalPriceNum = product.originalPrice
      ? parseFloat(product.originalPrice.replace(/[$,]/g, "")) || 0
      : undefined;

    return {
      _id: product._id,
      id: product.productId,
      name: product.name,
      category: product.category,
      price: priceNum,
      originalPrice: originalPriceNum,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      image: product.image,
      description: product.description,
      features: product.features || [],
      specs: product.specifications || {},
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockCount: product.stockCount || 0,
      shippingTime: product.shippingTime || "2-3 days",
      warranty: product.warranty || "2 years warranty included",
    };
  });

  // Helper to format prices for display
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

  const addToCart = (robot: any) => {
    addItem({
      id: robot.id,
      name: robot.name,
      price: robot.price,
      priceValue: robot.price,
      image: robot.image,
      specifications: robot.specs,
    });
    toast.success(`${robot.name} added to cart!`);
  };

  const toggleFavorite = (robotId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(robotId)) {
        newFavorites.delete(robotId);
        toast.info("Removed from favorites");
      } else {
        newFavorites.add(robotId);
        toast.success("Added to favorites!");
      }
      return newFavorites;
    });
  };

  const toggleFeatures = (productId: string) => {
    setExpandedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleLike = async (productId: string) => {
    if (!isAuthenticated) {
      toast.info("Please login to like products");
      return;
    }

    try {
      const response = await productLikesAPI.toggleLike(productId);
      if (response.data.success) {
        setLikeCounts((prev) => ({
          ...prev,
          [productId]: response.data.data.likeCount,
        }));

        setLikedProducts((prev) => {
          const newSet = new Set(prev);
          if (response.data.data.isLiked) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });

        toast.success(
          response.data.data.isLiked
            ? "Product liked!"
            : "Product unliked!"
        );
      }
    } catch (err: any) {
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to toggle like");
    }
  };

  const handleShare = (productId: string) => {
    const url = `${window.location.origin}/products/${productId}`;
    setShareUrl(url);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Products are now fetched from API and transformed above

  const categories = [
    { id: "all", name: "All Products", count: robots.length },
    {
      id: "exploration",
      name: "Exploration",
      count: robots.filter((r) => r.category === "exploration").length,
    },
    {
      id: "industrial",
      name: "Industrial",
      count: robots.filter((r) => r.category === "industrial").length,
    },
    {
      id: "surveillance",
      name: "Surveillance",
      count: robots.filter((r) => r.category === "surveillance").length,
    },
    {
      id: "research",
      name: "Research",
      count: robots.filter((r) => r.category === "research").length,
    },
  ];

  const filteredRobots =
    selectedCategory === "all"
      ? robots
      : robots.filter((robot) => robot.category === selectedCategory);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center relative">
            {/* Shopping Cart Button - Using the dedicated component */}
            <div className="absolute top-0 right-0">
              <ShoppingCartComponent />
            </div>

            <Badge variant="outline" className="mb-4">
              <Bot className="w-3 h-3 mr-1" />
              Advanced Robotics Store
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Our <span className="text-primary">4WD Robot</span> Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our premium line of 4WD robots engineered for precision,
              reliability, and performance. Shop with confidence - Free shipping
              on all orders!
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Filter by Category:</span>
          </div>
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full lg:w-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredRobots.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No products found</p>
              <p className="text-sm text-muted-foreground">
                {selectedCategory !== "all"
                  ? `No products in the ${selectedCategory} category.`
                  : "No products available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {filteredRobots.map((robot) => (
              <Card
                key={robot.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    {/* Badge removed - can be added back if needed in product data */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLike(robot._id)}
                        className="h-8 w-8"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedProducts.has(robot._id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      {likeCounts[robot._id] > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {likeCounts[robot._id]}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShare(robot._id)}
                      >
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full h-48 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    {robot.image && (robot.image.startsWith('http') || robot.image.startsWith('https')) ? (
                      <img
                        src={robot.image}
                        alt={robot.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-6xl">{robot.image || "🤖"}</div>
                    )}
                    {!robot.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {robot.rating}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({robot.reviews} reviews)
                    </span>
                  </div>

                  <CardTitle className="text-xl font-display mb-2">
                    {robot.name}
                  </CardTitle>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(robot.price)}
                    </div>
                    {robot.originalPrice && (
                      <div className="text-lg text-muted-foreground line-through">
                        {formatPrice(robot.originalPrice)}
                      </div>
                    )}
                  </div>

                  {/* Stock & Shipping Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        {robot.inStock
                          ? `In Stock (${robot.stockCount} available)`
                          : "Currently unavailable"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" />
                      <span>Ships in {robot.shippingTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>{robot.warranty} warranty included</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <CardDescription className="text-base leading-relaxed">
                    {robot.description}
                  </CardDescription>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <SpecBadge
                      icon={Gauge}
                      label="Max Speed"
                      value={robot.specs.speed}
                    />
                    <SpecBadge
                      icon={Zap}
                      label="Payload"
                      value={robot.specs.payload}
                    />
                    <SpecBadge
                      icon={Camera}
                      label="Range"
                      value={robot.specs.range}
                    />
                    <SpecBadge
                      icon={Battery}
                      label="Battery"
                      value={robot.specs.battery}
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="space-y-2">
                      {robot.features
                        .slice(
                          0,
                          expandedFeatures.has(robot._id)
                            ? robot.features.length
                            : 3
                        )
                        .map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-primary" />
                            {feature}
                          </div>
                        ))}
                      {robot.features.length > 3 && (
                        <button
                          onClick={() => toggleFeatures(robot._id)}
                          className="text-sm text-primary hover:underline cursor-pointer"
                        >
                          {expandedFeatures.has(robot._id)
                            ? "Show less"
                            : `+${robot.features.length - 3} more features`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Purchase Actions */}
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full gap-2 text-lg h-12"
                      onClick={() => addToCart(robot)}
                      disabled={!robot.inStock}
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      {robot.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/products/${robot._id}`} className="w-full">
                        <Button variant="outline" className="w-full gap-2">
                          <Bot className="w-4 h-4" />
                          View Details
                        </Button>
                      </Link>
                      <Link to="/controller" className="w-full">
                        <Button variant="outline" className="w-full gap-2">
                          <ArrowRight className="w-4 h-4" />
                          Try Demo
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>
              Copy the link below to share this product with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our engineering team can customize any robot to meet your specific
            requirements. Contact us to discuss your unique needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to='/contact'>
            <Button size="lg" className="gap-2">
              <Cpu className="w-5 h-5" />
              Request Custom Quote
            </Button>
            </Link>
            <Link to="/controller">
              <Button variant="outline" size="lg" className="gap-2">
                Test Drive Controller
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
 