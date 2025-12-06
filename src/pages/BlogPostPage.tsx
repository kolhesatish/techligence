import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogAPI } from "@/services/api";
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
  Calendar,
  User,
  Clock,
  MessageSquare,
  Heart,
  ArrowLeft,
  Bot,
  Cpu,
  Zap,
  BookOpen,
  Globe,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import DOMPurify from 'dompurify';

// Define interface for BlogPost to match backend schema
interface BlogPost {
  postId?: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedDate: string; // Will be a string from backend, convert to Date for formatting
  readTime: string;
  category: string;
  image: string;
  likes: number;
  comments: number;
  featured: boolean;
  published?: boolean;
  content: string; // Full content of the blog post (HTML format)
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL
  const navigate = useNavigate();

  // Fetch single blog post using react-query
  const { data: blogPost, isLoading, isError, error } = useQuery<BlogPost, Error>({
    queryKey: ["blogPost", slug], // Unique key for this specific post
    queryFn: async () => {
      if (!slug) {
        throw new Error("Blog post slug is missing.");
      }
      const response = await blogAPI.getBlogPostBySlug(slug);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch blog post.");
      }
    },
    enabled: !!slug, // Only run the query if postId is available
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      robotics: Bot,
      ai: Cpu,
      technology: Zap,
      tutorials: BookOpen,
      industry: Globe,
      innovation: Lightbulb,
    };
    return icons[category] || BookOpen;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading blog post...</p>
      </div>
    );
  }

  if (isError) {
    // Redirect to blog list if post not found or error
    useEffect(() => {
      toast.error(error?.message || "Failed to load blog post. It might not exist.");
      navigate("/blog");
    }, [error, navigate]);
    return null; // Don't render anything while redirecting
  }

  if (!blogPost) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Blog post not found.</p>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(blogPost.category);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <Button
        variant="outline"
        onClick={() => navigate("/blog")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Button>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="gap-1">
              <CategoryIcon className="w-3 h-3" />
              {blogPost.category.charAt(0).toUpperCase() + blogPost.category.slice(1)}
            </Badge>
            {blogPost.featured && <Badge variant="outline">Featured</Badge>}
          </div>

          <div className="mb-4 text-center">
            {blogPost.image && (blogPost.image.startsWith('http://') || blogPost.image.startsWith('https://')) ? (
              <img 
                src={blogPost.image} 
                alt={blogPost.title}
                className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="text-6xl">{blogPost.image}</div>
            )}
          </div>
          <CardTitle className="text-4xl lg:text-5xl font-display font-bold text-center mb-4">
            {blogPost.title}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            {blogPost.excerpt}
          </CardDescription>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{blogPost.author}</span>
              <span className="text-xs">({blogPost.authorRole})</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blogPost.publishedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blogPost.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{blogPost.likes} Likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{blogPost.comments} Comments</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(blogPost.content || '', {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'hr'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostPage;
