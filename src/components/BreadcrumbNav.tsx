import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumb on homepage
  if (pathnames.length === 0) {
    return null;
  }

  const getBreadcrumbName = (path: string) => {
    const nameMap: Record<string, string> = {
      products: "Products",
      showcase: "Project Showcase",
      about: "About",
      contact: "Contact",
      career: "Career",
      blog: "Blog",
      tools: "Tools",
      controller: "Controller",
      internship: "Internship",
      "ml-tools": "ML Tools",
      admin: "Admin",
      dashboard: "Dashboard",
    };

    // Try to get from map, otherwise capitalize first letter
    return nameMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <div key={to} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{getBreadcrumbName(value)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{getBreadcrumbName(value)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNav;

