import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceCard from "@/components/ServiceCard";
import { fetchMarketplaceServices } from "@/lib/marketplace";

const FeaturedServices = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "featured"],
    queryFn: fetchMarketplaceServices,
  });

  const services = (data ?? []).slice(0, 6);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Curated marketplace</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-foreground md:text-4xl">High-signal services from rising builders, specialists, and tutors</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              StudentHub highlights offers that feel practical, portfolio-worthy, and globally relevant across code, design, research, teaching, and digital execution.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link to="/explore">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[340px] rounded-[1.75rem]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link to="/explore">View all services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
