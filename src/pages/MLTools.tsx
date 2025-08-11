import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
} from "lucide-react";
import MLToolDetail from "@/components/MLToolDetail"; // Import the new component
import { TOOLS_CONFIG } from "@/lib/constants.ts"; // Import the constants

const MLTools = () => {
  const { tool } = useParams();

  // If a specific tool is selected, render the detail view
  if (tool && TOOLS_CONFIG[tool as keyof typeof TOOLS_CONFIG]) {
    return <MLToolDetail tool={tool} />;
  }

  // Otherwise, render the list of all tools
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ML Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced machine learning tools for robotics applications
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(TOOLS_CONFIG).map(([key, tool]) => {
              const IconComponent = tool.icon;
              return (
                <Card key={key} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        tool.status === "Available"
                          ? "default"
                          : tool.status === "Beta"
                          ? "secondary"
                          : "outline"
                      }
                      className="mb-4"
                    >
                      {tool.status}
                    </Badge>
                    <Link to={`/ml-tools/${key}`}>
                      <Button className="w-full">Explore Tool</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLTools;
