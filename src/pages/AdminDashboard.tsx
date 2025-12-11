import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, Plus, Edit, Trash2, Package, Briefcase, FileText, 
  MapPin, Clock, DollarSign, Building, User, Mail, Phone, 
  Download, Eye, CheckCircle, XCircle, Clock as ClockIcon, GraduationCap,
  ShoppingCart, Truck, CreditCard, BookOpen, Wrench, TrendingUp,
  BarChart3, Activity, Users, Sparkles, ArrowRight, Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { productsAPI, careerAPI, ordersAPI, blogAPI, toolsAPI } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateJobListingForm from "@/components/CreateJobListingForm";

interface Product {
  _id: string;
  productId: number;
  name: string;
  price: string;
  image: string;
  category: string;
  inStock: boolean;
  stockCount: number;
}

interface JobListing {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobApplication {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  currentTitle?: string;
  currentCompany?: string;
  totalExperience?: string;
  relevantExperience?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  education?: string;
  university?: string;
  graduationYear?: string;
  jobTitle: string;
  jobDepartment: string;
  jobLocation: string;
  jobId: {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: string;
  };
  resumeUrl: string;
  portfolioUrl?: string;
  status: string;
  coverLetter?: string;
  whyJoin?: string;
  availability?: string;
  relocate?: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  customer: {
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    productId: number;
    name: string;
    price: string;
    priceValue: number;
    quantity: number;
    image?: string;
  }>;
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost {
  _id: string;
  postId?: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  readTime: string;
  category: string;
  image: string;
  likes: number;
  comments: number;
  featured: boolean;
  published?: boolean;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Tool {
  _id: string;
  title: string;
  slug: string;
  description: string;
  htmlContent: string;
  status: "draft" | "published";
  icon?: string;
  image?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Check for tab parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "products";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", value);
    window.history.pushState({}, "", newUrl.toString());
  };
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Jobs state
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [isCreateJobFormOpen, setIsCreateJobFormOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteJobDialogOpen, setDeleteJobDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<string>("all");
  const [selectedPaymentStatusFilter, setSelectedPaymentStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [deleteBlogDialogOpen, setDeleteBlogDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null); // Changed to string for slug
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null); // Changed to string for slug

  // Tools state
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [deleteToolDialogOpen, setDeleteToolDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [deletingToolId, setDeletingToolId] = useState<string | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        toast.error("Admin access only.");
        navigate("/");
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getProducts();
        if (response.data.success) {
          setProducts(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "products") {
      fetchProducts();
    }
  }, [isAuthenticated, user, activeTab]);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await careerAPI.getJobListings();
        if (response.data.success) {
          setJobs(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch jobs:", error);
        toast.error("Failed to load job listings");
      } finally {
        setJobsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "jobs") {
      fetchJobs();
    }
  }, [isAuthenticated, user, activeTab]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setApplicationsLoading(true);
      try {
        const params: any = {};
        if (selectedJobFilter !== "all") {
          params.jobId = selectedJobFilter;
        }
        if (selectedStatusFilter !== "all") {
          params.status = selectedStatusFilter;
        }
        const response = await careerAPI.getApplications(params);
        if (response.data.success) {
          setApplications(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setApplicationsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "applications") {
      fetchApplications();
    }
  }, [isAuthenticated, user, activeTab, selectedJobFilter, selectedStatusFilter]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true);
      try {
        // Use admin endpoint to get all blogs including drafts
        const response = await blogAPI.getAllBlogPosts();
        if (response.data.success) {
          setBlogs(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error);
        toast.error("Failed to load blog posts");
      } finally {
        setBlogsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "blogs") {
      fetchBlogs();
    }
  }, [isAuthenticated, user, activeTab]);

  // Fetch tools
  useEffect(() => {
    const fetchTools = async () => {
      setToolsLoading(true);
      try {
        const response = await toolsAPI.getAllTools();
        if (response.data.success) {
          setTools(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch tools:", error);
        toast.error("Failed to load tools");
      } finally {
        setToolsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "tools") {
      fetchTools();
    }
  }, [isAuthenticated, user, activeTab]);

  // Fetch tools when URL has tab=tools parameter (e.g., after creating a tool)
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && initialTab === "tools") {
      const fetchTools = async () => {
        setToolsLoading(true);
        try {
          const response = await toolsAPI.getAllTools();
          if (response.data.success) {
            setTools(response.data.data || []);
          }
        } catch (error: any) {
          console.error("Failed to fetch tools:", error);
          toast.error("Failed to load tools");
        } finally {
          setToolsLoading(false);
        }
      };
      fetchTools();
    }
  }, [isAuthenticated, user, initialTab]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const params: any = {};
        if (selectedOrderStatusFilter !== "all") {
          params.status = selectedOrderStatusFilter;
        }
        if (selectedPaymentStatusFilter !== "all") {
          params.paymentStatus = selectedPaymentStatusFilter;
        }
        const response = await ordersAPI.getOrders(params);
        if (response.data.success) {
          setOrders(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && activeTab === "orders") {
      fetchOrders();
    }
  }, [isAuthenticated, user, activeTab, selectedOrderStatusFilter, selectedPaymentStatusFilter]);

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProductId(productId);
    try {
      const response = await productsAPI.deleteProduct(productId);
      if (response.data.success) {
        toast.success("Product deleted successfully");
        setProducts(products.filter((p) => p.productId !== productId));
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
      setDeleteProductDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await careerAPI.deleteJobListing(jobId);
      if (response.data.success) {
        toast.success("Job listing deleted successfully");
        setJobs(jobs.filter((j) => j._id !== jobId));
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Failed to delete job:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete job listing");
    } finally {
      setDeleteJobDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteBlog = async (slugOrId: string) => {
    setDeletingBlogId(slugOrId);
    try {
      // Use slug if available, otherwise use postId
      const response = await blogAPI.deleteBlogPostBySlugOrId(slugOrId);
      if (response.data.success) {
        toast.success("Blog post deleted successfully");
        setBlogs(blogs.filter((b) => (b.slug || String(b.postId)) !== slugOrId));
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Failed to delete blog:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete blog post");
    } finally {
      setDeletingBlogId(null);
      setDeleteBlogDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    setDeletingToolId(toolId);
    try {
      const response = await toolsAPI.deleteTool(toolId);
      if (response.data.success) {
        toast.success("Tool deleted successfully");
        setTools(tools.filter((t) => t._id !== toolId));
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Failed to delete tool:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete tool");
    } finally {
      setDeletingToolId(null);
      setDeleteToolDialogOpen(false);
      setToolToDelete(null);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await careerAPI.updateApplicationStatus(applicationId, { status });
      if (response.data.success) {
        toast.success("Application status updated");
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status } : app
        ));
      }
    } catch (error: any) {
      console.error("Failed to update application status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: ClockIcon, label: "Pending" },
      reviewed: { variant: "default" as const, icon: Eye, label: "Reviewed" },
      shortlisted: { variant: "default" as const, icon: CheckCircle, label: "Shortlisted" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
      accepted: { variant: "default" as const, icon: CheckCircle, label: "Accepted" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.isActive).length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.payment.status === 'completed' ? order.total : 0), 0),
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter(b => b.published !== false).length,
    totalTools: tools.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Header Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] opacity-50" />
        <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-white/[0.02] bg-[length:40px_40px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4" />
                  Welcome back, <span className="font-semibold text-foreground">{user?.firstName || 'Admin'}</span>
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-5 py-2.5 text-sm font-medium shadow-md border border-border/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <Activity className="w-4 h-4 mr-2" />
              System Active
            </Badge>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-blue-50/50 via-card to-card dark:from-blue-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Products</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground">Total items</p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-green-50/50 via-card to-card dark:from-green-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 dark:from-green-500/10 dark:to-green-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Jobs</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.activeJobs}<span className="text-lg text-muted-foreground">/{stats.totalJobs}</span></p>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-purple-50/50 via-card to-card dark:from-purple-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 dark:from-purple-500/10 dark:to-purple-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Applications</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.totalApplications}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{stats.pendingApplications} pending review</p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-orange-50/50 via-card to-card dark:from-orange-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 dark:from-orange-500/10 dark:to-orange-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Orders</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total orders</p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-emerald-50/50 via-card to-card dark:from-emerald-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 dark:from-emerald-500/10 dark:to-emerald-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Revenue</p>
                <p className="text-2xl font-bold text-foreground mb-1">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-indigo-50/50 via-card to-card dark:from-indigo-950/20 dark:via-card dark:to-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 dark:from-indigo-500/10 dark:to-indigo-600/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Content</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.publishedBlogs}<span className="text-lg text-muted-foreground">/{stats.totalBlogs}</span></p>
                <p className="text-xs text-muted-foreground">Published posts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1.5 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl shadow-inner">
            <TabsTrigger 
              value="products" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="blogs" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Blogs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 font-medium"
            >
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  Products Management
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage your product catalog and inventory</p>
              </div>
              <Button 
                onClick={() => navigate("/admin/products/new")} 
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <Package className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No products found</h3>
                  <p className="text-muted-foreground mb-8 text-center max-w-md text-base">
                    Get started by adding your first product to the catalog
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/products/new")} 
                    size="lg" 
                    className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8"
                  >
                    <Plus className="h-5 w-5" />
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card 
                    key={product._id} 
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-muted/60 to-muted/30 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20">
                          <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant={product.inStock ? "default" : "destructive"} 
                          className="shadow-xl backdrop-blur-sm border border-white/20"
                        >
                          {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <Badge variant="outline" className="text-xs font-medium">ID: {product.productId}</Badge>
                        <Badge variant="secondary" className="text-xs font-medium">{product.category}</Badge>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-3xl font-bold text-primary">{product.price}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Stock: <span className="text-foreground font-bold">{product.stockCount}</span></span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/products/edit/${product.productId}`)}
                          className="flex-1 gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product.productId);
                            setDeleteProductDialogOpen(true);
                          }}
                          disabled={deletingProductId === product.productId}
                          className="flex-1 gap-2 hover:scale-105 transition-all font-medium"
                        >
                          {deletingProductId === product.productId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  Job Postings
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage career opportunities and job listings</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingJobId(null);
                  setIsCreateJobFormOpen(true);
                }}
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Create New Job
              </Button>
            </div>

            {jobsLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading job postings...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <Briefcase className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No job postings found</h3>
                  <p className="text-muted-foreground mb-8 text-center max-w-md text-base">
                    Create your first job posting to attract top talent
                  </p>
                  <Button 
                    onClick={() => {
                      setEditingJobId(null);
                      setIsCreateJobFormOpen(true);
                    }}
                    size="lg"
                    className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Job Posting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card 
                    key={job._id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold mb-2">{job.title}</CardTitle>
                              <CardDescription className="text-base leading-relaxed line-clamp-2">{job.description}</CardDescription>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              <Building className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Department</p>
                                <p className="text-sm font-medium">{job.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              <MapPin className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{job.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Type</p>
                                <p className="text-sm font-medium">{job.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Salary</p>
                                <p className="text-sm font-medium">{job.salary}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.isActive ? "default" : "destructive"} className="text-sm">
                              {job.isActive ? "✓ Active" : "✗ Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingJobId(job._id);
                              setIsCreateJobFormOpen(true);
                            }}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setJobToDelete(job._id);
                              setDeleteJobDialogOpen(true);
                            }}
                            className="gap-2 hover:scale-105 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-8 space-y-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    Job Applications
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Review and manage candidate applications</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                  <SelectTrigger className="w-[200px] border-2">
                    <SelectValue placeholder="Filter by job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                  <SelectTrigger className="w-[200px] border-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {applicationsLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading applications...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No applications found</h3>
                  <p className="text-muted-foreground text-center max-w-md text-base">
                    Applications will appear here when candidates apply for your job postings
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card 
                    key={application._id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-primary">
                                {application.firstName[0]}{application.lastName[0]}
                              </span>
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold mb-1">
                                {application.firstName} {application.lastName}
                              </CardTitle>
                              <CardDescription className="text-base">
                                Applied for: <span className="font-semibold">{application.jobTitle}</span> - {application.jobDepartment}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Mail className="w-4 h-4 text-primary" />
                              <span className="text-sm truncate">{application.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Phone className="w-4 h-4 text-primary" />
                              <span className="text-sm">{application.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-sm">{application.jobLocation}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm">{new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setApplicationDialogOpen(true);
                            }}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(application.resumeUrl, '_blank')}
                            className="gap-2 hover:bg-green-500 hover:text-white transition-all"
                          >
                            <Download className="h-4 w-4" />
                            Resume
                          </Button>
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleUpdateApplicationStatus(application._id, value)}
                          >
                            <SelectTrigger className="w-[140px] border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-8 space-y-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                    </div>
                    Orders Management
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Track and manage customer orders</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Select value={selectedOrderStatusFilter} onValueChange={setSelectedOrderStatusFilter}>
                  <SelectTrigger className="w-[200px] border-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPaymentStatusFilter} onValueChange={setSelectedPaymentStatusFilter}>
                  <SelectTrigger className="w-[200px] border-2">
                    <SelectValue placeholder="Filter by payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <ShoppingCart className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No orders found</h3>
                  <p className="text-muted-foreground text-center max-w-md text-base">
                    Orders will appear here when customers make purchases
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card 
                    key={order._id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold mb-1">
                                Order #{order.orderNumber}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {order.customer.firstName} {order.customer.lastName} • {order.customer.email}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <CreditCard className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-sm font-bold text-green-600">₹{order.total.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Package className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Items</p>
                                <p className="text-sm font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <CreditCard className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Payment</p>
                                <p className="text-sm font-medium capitalize">{order.payment.status}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'default' :
                              order.status === 'processing' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                              order.status === 'refunded' ? 'destructive' : 'secondary'
                            } className="text-sm">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            {order.trackingNumber && (
                              <Badge variant="outline" className="text-sm">
                                <Truck className="w-3 h-3 mr-1" />
                                {order.trackingNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderDialogOpen(true);
                            }}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => {
                              ordersAPI.updateOrderStatus(order._id, { status: value })
                                .then((response) => {
                                  if (response.data.success) {
                                    toast.success("Order status updated");
                                    setOrders(orders.map(o => 
                                      o._id === order._id ? { ...o, status: value } : o
                                    ));
                                  }
                                })
                                .catch((error) => {
                                  console.error("Failed to update order status:", error);
                                  toast.error(error.response?.data?.message || "Failed to update status");
                                });
                            }}
                          >
                            <SelectTrigger className="w-[140px] border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs" className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  Blog Posts
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage your blog content and articles</p>
              </div>
              <Button 
                onClick={() => navigate("/admin/blog/new")}
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Create New Blog Post
              </Button>
            </div>

            {blogsLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading blog posts...</p>
                </div>
              </div>
            ) : blogs.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <BookOpen className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No blog posts found</h3>
                  <p className="text-muted-foreground mb-8 text-center max-w-md text-base">
                    Create your first blog post to share insights and updates
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/blog/new")}
                    size="lg"
                    className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Blog Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {blogs.map((blog) => (
                  <Card 
                    key={blog._id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            {blog.image && (
                              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 overflow-hidden flex-shrink-0">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold mb-2">{blog.title}</CardTitle>
                              <CardDescription className="text-base leading-relaxed line-clamp-2">{blog.excerpt}</CardDescription>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <User className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Author</p>
                                <p className="text-sm font-medium">{blog.author}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Published</p>
                                <p className="text-sm font-medium">{new Date(blog.publishedDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Read Time</p>
                                <p className="text-sm font-medium">{blog.readTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{blog.category}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {blog.featured && <Badge variant="default">⭐ Featured</Badge>}
                              <Badge variant={blog.published !== false ? "default" : "secondary"}>
                                {blog.published !== false ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/blog/edit/${blog.slug || blog.postId}`)}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBlogToDelete(blog.slug || String(blog.postId));
                              setDeleteBlogDialogOpen(true);
                            }}
                            disabled={deletingBlogId === (blog.slug || String(blog.postId))}
                            className="gap-2 hover:scale-105 transition-all"
                          >
                            {deletingBlogId === (blog.slug || String(blog.postId)) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  Tools Management
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage interactive tools and utilities</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setToolsLoading(true);
                    try {
                      const response = await toolsAPI.getAllTools();
                      if (response.data.success) {
                        setTools(response.data.data || []);
                        toast.success("Tools list refreshed");
                      }
                    } catch (error: any) {
                      console.error("Failed to refresh tools:", error);
                      toast.error("Failed to refresh tools");
                    } finally {
                      setToolsLoading(false);
                    }
                  }}
                  disabled={toolsLoading}
                  className="gap-2 hover:bg-muted transition-all"
                >
                  {toolsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
                <Button 
                  onClick={() => navigate("/admin/tools/new")}
                  className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  size="lg"
                >
                  <Plus className="h-4 w-4" />
                  Create New Tool
                </Button>
              </div>
            </div>

            {toolsLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground font-medium">Loading tools...</p>
                </div>
              </div>
            ) : tools.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-xl">
                      <Wrench className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">No tools found</h3>
                  <p className="text-muted-foreground mb-8 text-center max-w-md text-base">
                    Create your first interactive tool for users
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/tools/new")}
                    size="lg"
                    className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Tool
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {tools.map((tool) => (
                  <Card 
                    key={tool._id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                              {tool.image ? (
                                <img
                                  src={tool.image}
                                  alt={tool.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl">{tool.icon || "🔧"}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold mb-2">{tool.title}</CardTitle>
                              <CardDescription className="text-base leading-relaxed">{tool.description}</CardDescription>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{new Date(tool.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {tool.category && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <Building className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Category</p>
                                  <p className="text-sm font-medium">{tool.category}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant={tool.status === "published" ? "default" : "secondary"} className="text-sm">
                                {tool.status === "published" ? "✓ Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/tools/edit/${tool._id}`)}
                            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (tool.status === "published") {
                                window.open(`/tools/${tool.slug}`, "_blank");
                              } else {
                                toast.info("Tool is in draft status. Publish it first to view publicly.");
                              }
                            }}
                            disabled={tool.status === "draft"}
                            title={tool.status === "draft" ? "Publish tool first to view" : "View published tool"}
                            className="gap-2 hover:bg-green-500 hover:text-white transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setToolToDelete(tool._id);
                              setDeleteToolDialogOpen(true);
                            }}
                            disabled={deletingToolId === tool._id}
                            className="gap-2 hover:scale-105 transition-all"
                          >
                            {deletingToolId === tool._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>
        </Tabs>
      </div>

      {/* Delete Product Dialog */}
      <AlertDialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Job Dialog */}
      <AlertDialog open={deleteJobDialogOpen} onOpenChange={setDeleteJobDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job listing from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Blog Dialog */}
      <AlertDialog open={deleteBlogDialogOpen} onOpenChange={setDeleteBlogDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blogToDelete && handleDeleteBlog(blogToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tool Dialog */}
      <AlertDialog open={deleteToolDialogOpen} onOpenChange={setDeleteToolDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tool from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toolToDelete && handleDeleteTool(toolToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Application Detail Dialog */}
      {selectedApplication && (
        <AlertDialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <AlertDialogHeader className="flex-shrink-0">
              <AlertDialogTitle className="text-2xl">
                {selectedApplication.firstName} {selectedApplication.lastName}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Application for {selectedApplication.jobTitle} - {selectedApplication.jobDepartment}
              </AlertDialogDescription>
              <div className="mt-2">
                {getStatusBadge(selectedApplication.status)}
              </div>
            </AlertDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>First Name:</strong> {selectedApplication.firstName}
                  </div>
                  <div>
                    <strong>Last Name:</strong> {selectedApplication.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> <a href={`mailto:${selectedApplication.email}`} className="text-primary hover:underline">{selectedApplication.email}</a>
                  </div>
                  <div>
                    <strong>Phone:</strong> <a href={`tel:${selectedApplication.phone}`} className="text-primary hover:underline">{selectedApplication.phone}</a>
                  </div>
                  {selectedApplication.address && (
                    <div>
                      <strong>Address:</strong> {selectedApplication.address}
                    </div>
                  )}
                  {selectedApplication.city && (
                    <div>
                      <strong>City:</strong> {selectedApplication.city}
                    </div>
                  )}
                  {selectedApplication.state && (
                    <div>
                      <strong>State:</strong> {selectedApplication.state}
                    </div>
                  )}
                  {selectedApplication.zipCode && (
                    <div>
                      <strong>Zip Code:</strong> {selectedApplication.zipCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {selectedApplication.currentTitle && (
                    <div>
                      <strong>Current Title:</strong> {selectedApplication.currentTitle}
                    </div>
                  )}
                  {selectedApplication.currentCompany && (
                    <div>
                      <strong>Current Company:</strong> {selectedApplication.currentCompany}
                    </div>
                  )}
                  {selectedApplication.totalExperience && (
                    <div>
                      <strong>Total Experience:</strong> {selectedApplication.totalExperience}
                    </div>
                  )}
                  {selectedApplication.relevantExperience && (
                    <div>
                      <strong>Relevant Experience:</strong> {selectedApplication.relevantExperience}
                    </div>
                  )}
                  {selectedApplication.expectedSalary && (
                    <div>
                      <strong>Expected Salary:</strong> {selectedApplication.expectedSalary}
                    </div>
                  )}
                  {selectedApplication.noticePeriod && (
                    <div>
                      <strong>Notice Period:</strong> {selectedApplication.noticePeriod}
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {(selectedApplication.education || selectedApplication.university || selectedApplication.graduationYear) && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {selectedApplication.education && (
                      <div>
                        <strong>Education:</strong> {selectedApplication.education}
                      </div>
                    )}
                    {selectedApplication.university && (
                      <div>
                        <strong>University:</strong> {selectedApplication.university}
                      </div>
                    )}
                    {selectedApplication.graduationYear && (
                      <div>
                        <strong>Graduation Year:</strong> {selectedApplication.graduationYear}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Job Application Details */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Job Title:</strong> {selectedApplication.jobTitle}
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedApplication.jobDepartment}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedApplication.jobLocation}
                  </div>
                  {selectedApplication.availability && (
                    <div>
                      <strong>Availability:</strong> {selectedApplication.availability}
                    </div>
                  )}
                  <div>
                    <strong>Willing to Relocate:</strong> {selectedApplication.relocate ? "Yes" : "No"}
                  </div>
                  {selectedApplication.whyJoin && (
                    <div>
                      <strong>Why Join:</strong>
                      <p className="mt-1 text-muted-foreground">{selectedApplication.whyJoin}</p>
                    </div>
                  )}
                  {selectedApplication.coverLetter && (
                    <div>
                      <strong>Cover Letter:</strong>
                      <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                  {selectedApplication.portfolioUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedApplication.portfolioUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Portfolio
                    </Button>
                  )}
                </div>
              </div>

              {/* Application Metadata */}
              <div className="pb-4">
                <h4 className="font-semibold text-lg mb-3">Application Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Applied On:</strong> {new Date(selectedApplication.createdAt).toLocaleString()}
                  </div>
                  {selectedApplication.updatedAt && (
                    <div>
                      <strong>Last Updated:</strong> {new Date(selectedApplication.updatedAt).toLocaleString()}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </div>
                </div>
                {selectedApplication.adminNotes && (
                  <div className="mt-3">
                    <strong>Admin Notes:</strong>
                    <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{selectedApplication.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
            <AlertDialogFooter className="flex-shrink-0">
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <AlertDialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <AlertDialogHeader className="flex-shrink-0">
              <AlertDialogTitle className="text-2xl">
                Order #{selectedOrder.orderNumber}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </AlertDialogDescription>
              <div className="mt-2">
                <Badge variant={
                  selectedOrder.status === 'delivered' ? 'default' :
                  selectedOrder.status === 'shipped' ? 'default' :
                  selectedOrder.status === 'processing' ? 'default' :
                  selectedOrder.status === 'cancelled' ? 'destructive' :
                  selectedOrder.status === 'refunded' ? 'destructive' : 'secondary'
                }>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>
            </AlertDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Customer Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Name:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> <a href={`mailto:${selectedOrder.customer.email}`} className="text-primary hover:underline">{selectedOrder.customer.email}</a>
                  </div>
                  <div>
                    <strong>Phone:</strong> <a href={`tel:${selectedOrder.customer.phone}`} className="text-primary hover:underline">{selectedOrder.customer.phone}</a>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h4>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 border rounded-lg">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">Price: ₹{item.priceValue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.priceValue * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Payment Status:</strong> {selectedOrder.payment.status}
                  </div>
                  <div>
                    <strong>Payment Method:</strong> {selectedOrder.payment.method}
                  </div>
                  <div>
                    <strong>Razorpay Order ID:</strong> {selectedOrder.payment.razorpayOrderId}
                  </div>
                  <div>
                    <strong>Razorpay Payment ID:</strong> {selectedOrder.payment.razorpayPaymentId}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="pb-4">
                <h4 className="font-semibold text-lg mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="mt-4">
                    <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="mt-4">
                    <strong>Notes:</strong>
                    <p className="text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <AlertDialogFooter className="flex-shrink-0">
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Create/Edit Job Form */}
      <CreateJobListingForm
        isOpen={isCreateJobFormOpen}
        onClose={() => {
          setIsCreateJobFormOpen(false);
          setEditingJobId(null);
          if (activeTab === "jobs") {
            // Refetch jobs
            careerAPI.getJobListings().then((response) => {
              if (response.data.success) {
                setJobs(response.data.data || []);
              }
            });
          }
        }}
        jobId={editingJobId}
      />
    </div>
  );
};

export default AdminDashboard;
