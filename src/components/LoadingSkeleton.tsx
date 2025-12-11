import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 bg-muted rounded animate-pulse mb-2 w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-9 bg-muted rounded animate-pulse flex-1" />
          <div className="h-9 bg-muted rounded animate-pulse w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <Card>
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 bg-muted rounded animate-pulse mb-2 w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export const TextSkeleton = ({ lines = 3, className = "" }: { lines?: number; className?: string }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted rounded animate-pulse ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 bg-muted rounded animate-pulse flex-1" />
          <div className="h-10 bg-muted rounded animate-pulse w-32" />
          <div className="h-10 bg-muted rounded animate-pulse w-24" />
        </div>
      ))}
    </div>
  );
};

