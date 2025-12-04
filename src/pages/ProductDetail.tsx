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
}

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
    if (typeof price === "string") {
      return price;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <Button
        variant="outline"
        onClick={() => navigate("/products")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="w-full h-96 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
              {product.image &&
              (product.image.startsWith("http") ||
                product.image.startsWith("https")) ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-6xl">{product.image || "🤖"}</div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Product Details */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline">{product.category}</Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleLike}
                  disabled={loadingLike}
                  className="h-8 w-8"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="h-8 w-8"
                >
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <CardTitle className="text-3xl lg:text-4xl font-display font-bold mb-4">
              {product.name}
            </CardTitle>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({product.reviews} reviews)
              </span>
              {likeCount > 0 && (
                <span className="text-muted-foreground">
                  • {likeCount} {likeCount === 1 ? "like" : "likes"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>

            <CardDescription className="text-base leading-relaxed mb-6">
              {product.description}
            </CardDescription>

            {/* Stock & Shipping Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">
                  {product.inStock
                    ? `In Stock (${product.stockCount} available)`
                    : "Currently unavailable"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Ships in {product.shippingTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{product.warranty}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <SpecBadge
                icon={Gauge}
                label="Max Speed"
                value={product.specifications.speed || "N/A"}
              />
              <SpecBadge
                icon={Zap}
                label="Payload"
                value={product.specifications.payload || "N/A"}
              />
              <SpecBadge
                icon={Camera}
                label="Range"
                value={product.specifications.range || "N/A"}
              />
              <SpecBadge
                icon={Battery}
                label="Battery"
                value={product.specifications.battery || "N/A"}
              />
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-3 pt-4">
              <Button
                className="w-full gap-2 text-lg h-12"
                onClick={addToCart}
                disabled={!product.inStock}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;

