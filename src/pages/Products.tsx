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
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import ShoppingCartComponent from "@/components/ShoppingCart"; // Renamed to avoid conflict
import { productsAPI, productLikesAPI } from "@/services/api";
import { Loader2, Copy, Check, X, List } from "lucide-react";
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
  FileDown,
  PlayCircle,
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
  datasheetUrl?: string;
  demoUrl?: string;
  technicalDetails?: {
    motors?: string[];
    sensors?: string[];
    battery?: string;
  };
}

const fallbackTechnicalDetails: Record<string, Product["technicalDetails"]> = {
  exploration: {
    motors: ["4x BLDC hub motors"],
    sensors: ["LiDAR + depth camera"],
    battery: "48V Li-ion, swappable",
  },
  industrial: {
    motors: ["Planetary geared drive"],
    sensors: ["Safety LiDAR + RGB-D"],
    battery: "48V Li-ion, hot-swap",
  },
  ai: {
    motors: ["BLDC 200W drive"],
    sensors: ["4K RGB + depth"],
    battery: "42V Li-ion",
  },
  default: {
    motors: ["High-torque BLDC drive"],
    sensors: ["Depth + IMU"],
    battery: "Li-ion pack",
  },
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync selectedCategory with URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    } else if (!categoryParam && selectedCategory !== "all") {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getProducts();
        if (response.data.success) {
          const fetchedProducts = response.data.data || [];
          setProducts(fetchedProducts);
          console.log("Products fetched:", fetchedProducts.length, fetchedProducts);
          
          // Log categories found
          const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
          console.log("Categories found:", uniqueCategories);
        } else {
          setError("Failed to load products");
          console.error("API response not successful:", response.data);
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

    const techDetails =
      product.technicalDetails ||
      fallbackTechnicalDetails[product.category?.toLowerCase()] ||
      fallbackTechnicalDetails.default;

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
      datasheetUrl: product.datasheetUrl,
      demoUrl: product.demoUrl,
      technicalDetails: techDetails,
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
      count: robots.filter((r) => r.category?.toLowerCase() === "exploration").length,
    },
    {
      id: "industrial",
      name: "Industrial",
      count: robots.filter((r) => r.category?.toLowerCase() === "industrial").length,
    },
    {
      id: "surveillance",
      name: "Surveillance",
      count: robots.filter((r) => r.category?.toLowerCase() === "surveillance").length,
    },
    {
      id: "research",
      name: "Research",
      count: robots.filter((r) => r.category?.toLowerCase() === "research").length,
    },
  ];

  const filteredRobots =
    selectedCategory === "all"
      ? robots
      : robots.filter((robot) => 
          robot.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

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
      {/* Hero Header */}
      <section className="relative py-20 bg-gradient-to-br from-background via-primary/5 to-secondary/10 border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:50px_50px] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          {/* Shopping Cart Button - Fixed position */}
          <div className="absolute top-4 right-4 z-20">
            <ShoppingCartComponent />
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Bot className="w-3 h-3 mr-2" />
              Advanced Robotics Store
            </Badge>
            <h1 
              className="text-4xl lg:text-6xl font-semibold mb-6 text-foreground cursor-pointer hover:text-primary transition-colors duration-300"
              onClick={() => {
                setSelectedCategory("all");
                setSearchParams({});
              }}
              title="Click to view all products"
            >
              Our <span className="text-primary">4WD Robot</span> Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our premium line of 4WD robots engineered for precision,
              reliability, and performance. Shop with confidence - Free shipping on all orders!
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filter by Category</h2>
              <p className="text-sm text-muted-foreground">Browse our robot collection</p>
            </div>
          </div>
          <Tabs
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              // Update URL when category changes
              if (value === "all") {
                setSearchParams({});
              } else {
                setSearchParams({ category: value });
              }
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full lg:w-auto gap-2 bg-background border">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
          <div className="flex gap-6 relative">
            {/* Sidebar Toggle Button - Mobile */}
            <div className="fixed top-24 right-4 z-30 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 lg:mr-80">
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
              <Card className="max-w-md mx-auto border-0 shadow-lg">
                <CardContent className="p-12">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedCategory !== "all"
                      ? `No products found in the "${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}" category.`
                      : products.length === 0
                      ? "No products available at the moment. Please check back later."
                      : "Try selecting a different category or check back later."}
                  </p>
                  {products.length > 0 && selectedCategory !== "all" && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedCategory("all");
                        setSearchParams({});
                      }}
                      className="gap-2"
                    >
                      View All Products ({products.length})
                    </Button>
                  )}
                  {products.length === 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Debug Info:</p>
                      <p className="text-xs text-muted-foreground">Total products fetched: {products.length}</p>
                      <p className="text-xs text-muted-foreground">Selected category: {selectedCategory}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredRobots.map((robot) => (
              <Card
                key={robot.id}
                className="group border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-card"
              >
                <CardHeader className="relative p-0">
                  {/* Image Section - Reduced height */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-muted/30 via-primary/5 to-secondary/5 overflow-hidden">
                    {robot.image && (robot.image.startsWith('http') || robot.image.startsWith('https')) ? (
                      <>
                        <img
                          src={robot.image}
                          alt={robot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/10 to-secondary/10">
                        {robot.image || "🤖"}
                      </div>
                    )}
                    {!robot.inStock && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Badge variant="destructive" className="text-sm px-3 py-1">Out of Stock</Badge>
                      </div>
                    )}
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleLike(robot._id)}
                        className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-md border-0"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-all ${
                            likedProducts.has(robot._id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-md border-0"
                        onClick={() => handleShare(robot._id)}
                      >
                        <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-primary/95 backdrop-blur-sm text-primary-foreground text-xs px-2 py-0.5">
                        {robot.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Title & Rating - Compact */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-foreground leading-tight line-clamp-1">
                        {robot.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-foreground">{robot.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>({robot.reviews} reviews)</span>
                      {likeCounts[robot._id] > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          {likeCounts[robot._id]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price - Compact */}
                  <div className="flex items-baseline gap-2 pb-3 border-b">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(robot.price)}
                    </div>
                    {robot.originalPrice && (
                      <>
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(robot.originalPrice)}
                        </div>
                        <Badge variant="secondary" className="text-xs ml-1">
                          Save {Math.round(((robot.originalPrice - robot.price) / robot.originalPrice) * 100)}%
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Description - Compact */}
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {robot.description}
                  </CardDescription>

                  {/* Specifications - Compact Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                      <Gauge className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Speed</p>
                      <p className="text-xs font-bold text-foreground">{robot.specs?.speed || "N/A"}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-secondary" />
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Payload</p>
                      <p className="text-xs font-bold text-foreground">{robot.specs?.payload || "N/A"}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                      <Camera className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Range</p>
                      <p className="text-xs font-bold text-foreground">{robot.specs?.range || "N/A"}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                      <Battery className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Battery</p>
                      <p className="text-xs font-bold text-foreground">{robot.specs?.battery || "N/A"}</p>
                    </div>
                  </div>

                  {/* Stock & Shipping - Compact */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className={`w-4 h-4 ${robot.inStock ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={robot.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {robot.inStock ? `${robot.stockCount} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">{robot.shippingTime}</span>
                    </div>
                  </div>

                  {/* Purchase Actions - Compact */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button
                      className="w-full gap-2 h-10 font-medium shadow-sm hover:shadow-md transition-all"
                      onClick={() => addToCart(robot)}
                      disabled={!robot.inStock}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      {robot.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/products/${robot._id}`} className="w-full">
                        <Button variant="outline" className="w-full gap-1.5 h-9 text-sm">
                          <Bot className="w-3.5 h-3.5" />
                          Details
                        </Button>
                      </Link>
                      <Link to={robot.demoUrl || "/controller"} className="w-full">
                        <Button variant="outline" className="w-full gap-1.5 h-9 text-sm">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Demo
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

            {/* Sidebar - All Products */}
            <div className={`
              fixed top-0 right-0 h-full w-80 bg-background border-l shadow-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
              lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:border-l-0 lg:w-72
            `}>
              <div className="p-4 sticky top-0 bg-background border-b z-10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" />
                    All Products
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {robots.length} items
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchParams({});
                      setSidebarOpen(false);
                    }}
                    className="text-xs h-6"
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {robots.map((robot) => (
                  <Link
                    key={robot.id}
                    to={`/products/${robot._id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="block"
                  >
                    <Card className="group border hover:border-primary transition-all duration-200 hover:shadow-md cursor-pointer bg-gradient-to-br from-card to-card/50">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            {robot.image && (robot.image.startsWith('http') || robot.image.startsWith('https')) ? (
                              <img
                                src={robot.image}
                                alt={robot.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                                🤖
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                              {robot.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                              {robot.category}
                            </p>
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(robot.price)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
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
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Our engineering team can customize any robot to meet your specific
            requirements. Contact us to discuss your unique needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to='/contact'>
              <Button size="lg" className="gap-2 px-8 h-12 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Cpu className="w-5 h-5" />
                Request Custom Quote
              </Button>
            </Link>
            <Link to="/controller">
              <Button variant="outline" size="lg" className="gap-2 px-8 h-12 border-2 hover:bg-muted transition-all hover:scale-105">
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
 