import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { featuredServices } from "@/data/services";

const FeaturedServices = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Featured Services</h2>
          <p className="mt-2 text-muted-foreground">Hand-picked talent from top students</p>
        </div>
        <Button variant="ghost" asChild className="hidden sm:flex">
          <Link to="/explore">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredServices.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
      <div className="mt-8 text-center sm:hidden">
        <Button variant="outline" asChild>
          <Link to="/explore">View All Services</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default FeaturedServices;
