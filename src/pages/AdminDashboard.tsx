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
  ShoppingCart, Truck, CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { productsAPI, careerAPI, ordersAPI } from "@/services/api";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage products, jobs, and applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Products</h2>
            <Button onClick={() => navigate("/admin/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>

          {productsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No products found</p>
                <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
                <Button onClick={() => navigate("/admin/products/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {product.productId} | {product.category}
                    </p>
                    <p className="text-lg font-semibold text-primary mt-2">{product.price}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <span className="text-muted-foreground">
                        Stock: {product.stockCount}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/products/edit/${product.productId}`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
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
                        className="flex-1"
                      >
                        {deletingProductId === product.productId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
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
        <TabsContent value="jobs" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Job Postings</h2>
            <Button onClick={() => {
              setEditingJobId(null);
              setIsCreateJobFormOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </div>

          {jobsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No job postings found</p>
                <p className="text-muted-foreground mb-4">Create your first job posting</p>
                <Button onClick={() => {
                  setEditingJobId(null);
                  setIsCreateJobFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-2">{job.description}</CardDescription>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {job.department}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </div>
                          <Badge variant={job.isActive ? "default" : "destructive"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingJobId(job._id);
                            setIsCreateJobFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setJobToDelete(job._id);
                            setDeleteJobDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
        <TabsContent value="applications" className="mt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Job Applications</h2>
            </div>
            <div className="flex gap-4">
              <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                <SelectTrigger className="w-[200px]">
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
                <SelectTrigger className="w-[200px]">
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
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No applications found</p>
                <p className="text-muted-foreground">Applications will appear here when candidates apply</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {application.firstName} {application.lastName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Applied for: {application.jobTitle} - {application.jobDepartment}
                        </CardDescription>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {application.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.jobLocation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(application.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-4">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setApplicationDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.resumeUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleUpdateApplicationStatus(application._id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
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
        <TabsContent value="orders" className="mt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Orders</h2>
            </div>
            <div className="flex gap-4">
              <Select value={selectedOrderStatusFilter} onValueChange={setSelectedOrderStatusFilter}>
                <SelectTrigger className="w-[200px]">
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
                <SelectTrigger className="w-[200px]">
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
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No orders found</p>
                <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {order.customer.firstName} {order.customer.lastName} • {order.customer.email}
                        </CardDescription>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ₹{order.total.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            Payment: {order.payment.status}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'shipped' ? 'default' :
                            order.status === 'processing' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            order.status === 'refunded' ? 'destructive' : 'secondary'
                          }>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {order.trackingNumber && (
                            <Badge variant="outline">
                              <Truck className="w-3 h-3 mr-1" />
                              {order.trackingNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
                          <SelectTrigger className="w-[140px]">
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
      </Tabs>

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
                        <p className="text-sm text-muted-foreground">Price: {item.price}</p>
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
