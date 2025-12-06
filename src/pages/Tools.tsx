import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search,
  Wrench,
  Loader2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toolsAPI } from "@/services/api";

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

const Tools = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tools using react-query
  const { data: fetchedTools, isLoading, isError, error } = useQuery<Tool[], Error>({
    queryKey: ["tools"],
    queryFn: async () => {
      const response = await toolsAPI.getTools();
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch tools.");
      }
    },
  });

  const allTools = fetchedTools || [];

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique categories from tools
  const categories = [
    { id: "all", name: "All Tools", count: allTools.length },
    ...Array.from(new Set(allTools.map((t) => t.category).filter(Boolean))).map(
      (cat) => ({
        id: cat,
        name: cat,
        count: allTools.filter((t) => t.category === cat).length,
      })
    ),
  ];

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <Wrench className="w-3 h-3 mr-1" />
          Tools Collection
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
          Our <span className="text-primary">Tools</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our collection of useful tools and utilities to help you in
          your work and daily tasks.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tools Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading tools...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">
            {error?.message || "Failed to load tools"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No tools found</p>
          <p className="text-muted-foreground">
            {searchTerm
              ? `No tools match your search "${searchTerm}"`
              : "No tools available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Link key={tool._id} to={`/tools/${tool.slug}`}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer">
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    {tool.image ? (
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">{tool.icon || "🔧"}</div>
                    )}
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    {tool.category && (
                      <Badge variant="secondary">{tool.category}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-display mb-2">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-sm font-medium">Use Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tools;

