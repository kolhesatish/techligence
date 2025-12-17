export default function UseCases() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">
        Use Cases
      </h1>

      <p className="text-muted-foreground max-w-2xl mb-12">
        Discover how Techligence robotics solutions are transforming industries
        through real-world deployments.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-2">
            Smart Manufacturing
          </h3>
          <p className="text-muted-foreground">
            Autonomous robots improve production efficiency and accuracy.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-2">
            Security & Surveillance
          </h3>
          <p className="text-muted-foreground">
            AI-powered robots provide real-time monitoring and threat detection.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-2">
            Warehouse Automation
          </h3>
          <p className="text-muted-foreground">
            Optimized logistics with autonomous navigation and inventory control.
          </p>
        </div>
      </div>
    </div>
  );
}
