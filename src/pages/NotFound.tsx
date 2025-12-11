import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Showcase", path: "/showcase" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <SEOHead
        title="404 - Page Not Found | Techligence"
        description="The page you're looking for doesn't exist. Return to Techligence homepage or explore our products and services."
      />
      <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4">
        <Card className="max-w-2xl w-full border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
              <h1 className="text-3xl font-semibold mb-3 text-foreground">
                Page Not Found
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-sm text-muted-foreground">
                URL: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Home className="w-4 h-4" />
                  Go to Homepage
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Quick Links
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotFound;
