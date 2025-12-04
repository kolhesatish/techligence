import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { productsAPI } from "@/services/api";
import { ImageUpload } from "@/components/ImageUpload";

interface ProductFormData {
  productId: number | null;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  specifications: {
    speed: string;
    payload: string;
    range: string;
    battery: string;
  };
  features: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  shippingTime: string;
  warranty: string;
  category: string;
  priceValue: number;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = !!productId;

  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ProductFormData>({
    productId: null,
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    specifications: {
      speed: "",
      payload: "",
      range: "",
      battery: "",
    },
    features: [],
    rating: 0,
    reviews: 0,
    inStock: true,
    stockCount: 0,
    shippingTime: "2-3 days",
    warranty: "2 years warranty included",
    category: "",
    priceValue: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [featuresInput, setFeaturesInput] = useState("");

  const categories = [
    { id: "exploration", name: "Exploration" },
    { id: "industrial", name: "Industrial" },
    { id: "surveillance", name: "Surveillance" },
    { id: "research", name: "Research" },
  ];

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only.");
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode && productId) {
        setIsLoadingProduct(true);
        try {
          const response = await productsAPI.getProductById(parseInt(productId));
          if (response.data.success && response.data.data) {
            const productData = response.data.data;
            setFormData({
              productId: productData.productId,
              name: productData.name || "",
              description: productData.description || "",
              price: productData.price || "",
              originalPrice: productData.originalPrice || "",
              image: productData.image || "",
              specifications: {
                speed: productData.specifications?.speed || "",
                payload: productData.specifications?.payload || "",
                range: productData.specifications?.range || "",
                battery: productData.specifications?.battery || "",
              },
              features: productData.features || [],
              rating: productData.rating || 0,
              reviews: productData.reviews || 0,
              inStock: productData.inStock !== undefined ? productData.inStock : true,
              stockCount: productData.stockCount || 0,
              shippingTime: productData.shippingTime || "2-3 days",
              warranty: productData.warranty || "2 years warranty included",
              category: productData.category || "",
              priceValue: productData.priceValue || 0,
            });
            setFeaturesInput((productData.features || []).join(", "));
          }
        } catch (error: any) {
          console.error("Failed to fetch product:", error);
          toast.error("Failed to load product data");
          navigate("/admin/dashboard");
        } finally {
          setIsLoadingProduct(false);
        }
      }
    };

    fetchProduct();
  }, [isEditMode, productId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [name]: value },
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturesInput(e.target.value);
    const features = e.target.value.split(",").map((f) => f.trim()).filter((f) => f !== "");
    setFormData((prev) => ({ ...prev, features }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.description || !formData.price || !formData.category || formData.productId === null) {
        throw new Error("Please fill in all required fields.");
      }
      if (!formData.image) {
        throw new Error("Please upload a product image.");
      }
      if (formData.stockCount < 0 || formData.rating < 0 || formData.reviews < 0) {
        throw new Error("Numeric values cannot be negative.");
      }

      // Process price value
      const cleanPrice = formData.price.replace(/[$,]/g, "");
      const priceValue = parseFloat(cleanPrice) || 0;

      const dataToSend = {
        ...formData,
        priceValue,
        price: formData.price, // Keep formatted price string
        features: formData.features,
      };

      let response;
      if (isEditMode && productId) {
        response = await productsAPI.updateProduct(parseInt(productId), dataToSend);
      } else {
        response = await productsAPI.addProduct(dataToSend);
      }

      if (response.data.success) {
        toast.success(`Product ${isEditMode ? "updated" : "added"} successfully!`);
        navigate("/admin/dashboard");
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err: any) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} product:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} product.`);
      toast.error(err.response?.data?.message || err.message || `Failed to ${isEditMode ? "update" : "add"} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isEditMode && isLoadingProduct)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {authLoading ? "Loading..." : "Loading product data..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID *</Label>
                  <Input
                    id="productId"
                    name="productId"
                    type="number"
                    placeholder="e.g., 101"
                    value={formData.productId === null ? "" : formData.productId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        productId: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    required
                    disabled={isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., RoboTech Explorer Pro"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="text"
                    placeholder="$12,999"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="text"
                    placeholder="$15,999"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Product Image</h3>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                disabled={isSubmitting}
              />
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed</Label>
                  <Input
                    id="speed"
                    name="speed"
                    type="text"
                    placeholder="e.g., 5 m/s"
                    value={formData.specifications.speed}
                    onChange={handleSpecChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payload">Payload</Label>
                  <Input
                    id="payload"
                    name="payload"
                    type="text"
                    placeholder="e.g., 10 kg"
                    value={formData.specifications.payload}
                    onChange={handleSpecChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="range">Range</Label>
                  <Input
                    id="range"
                    name="range"
                    type="text"
                    placeholder="e.g., 500 m"
                    value={formData.specifications.range}
                    onChange={handleSpecChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery</Label>
                  <Input
                    id="battery"
                    name="battery"
                    type="text"
                    placeholder="e.g., 5000 mAh"
                    value={formData.specifications.battery}
                    onChange={handleSpecChange}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Features</h3>
              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  name="features"
                  type="text"
                  placeholder="e.g., GPS, Camera, AI Navigation"
                  value={featuresInput}
                  onChange={handleFeaturesChange}
                />
              </div>
            </div>

            {/* Stock & Ratings */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Stock & Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockCount">Stock Count</Label>
                  <Input
                    id="stockCount"
                    name="stockCount"
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockCount: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingTime">Shipping Time</Label>
                  <Input
                    id="shippingTime"
                    name="shippingTime"
                    type="text"
                    value={formData.shippingTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rating: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviews">Reviews Count</Label>
                  <Input
                    id="reviews"
                    name="reviews"
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reviews: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    name="warranty"
                    type="text"
                    value={formData.warranty}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, inStock: !!checked }))
                    }
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Add Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductForm;

