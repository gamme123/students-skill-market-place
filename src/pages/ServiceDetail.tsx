import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCategoryIcon } from "@/data/services";
import { fetchMarketplaceServiceById, fetchReviewsForService } from "@/lib/marketplace";

const ServiceDetail = () => {
  const { id = "" } = useParams();

  const serviceQuery = useQuery({
    queryKey: ["service", id],
    queryFn: () => fetchMarketplaceServiceById(id),
    enabled: Boolean(id),
  });

  const reviewQuery = useQuery({
    queryKey: ["service-reviews", id],
    queryFn: () => fetchReviewsForService(id, serviceQuery.data ?? undefined),
    enabled: Boolean(id) && Boolean(serviceQuery.data),
  });

  if (serviceQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <Skeleton className="h-[560px] rounded-[2rem] lg:col-span-2" />
            <Skeleton className="h-[360px] rounded-[2rem]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const service = serviceQuery.data;
  const reviews = reviewQuery.data ?? [];

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Service not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This listing could not be found in Supabase or the local fallback data.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/explore">Back to explore</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-8">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,white_100%)] p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.16),transparent_24%)]" />
              <div className="relative flex min-h-[260px] flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full px-4 py-1.5">{service.category}</Badge>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/75 text-4xl shadow-card">
                    {getCategoryIcon(service.category)}
                  </div>
                </div>
                <div className="mt-8">
                  <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl">
                    {service.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{service.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">{service.rating}</span>
                <span>({service.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {service.deliveryDays}-day delivery
              </div>
              <div className="rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
                {service.tags.length} skill tags
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            <section className="mt-10 border-t border-border pt-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buyer feedback from this listing or fallback sample reviews while the database fills up.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.5rem] border border-border bg-background p-5">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {review.reviewerInitials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
                          <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="h-3.5 w-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside>
            <div className="sticky top-28 rounded-[2rem] border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {service.sellerAvatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{service.sellerName}</p>
                  <p className="text-xs text-muted-foreground">{service.sellerUniversity}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-secondary/60 p-5 text-center">
                <span className="text-sm text-muted-foreground">Starting at</span>
                <p className="mt-2 text-4xl font-bold text-foreground">${service.price}</p>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="h-11 w-full rounded-xl" size="lg">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Order now
                </Button>
                <Button variant="outline" className="h-11 w-full rounded-xl" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact seller
                </Button>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
                  <span>Delivery time</span>
                  <span className="font-semibold text-foreground">{service.deliveryDays} days</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
                  <span>Rating</span>
                  <span className="font-semibold text-foreground">{service.rating}/5</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
                  <span>Reviews</span>
                  <span className="font-semibold text-foreground">{service.reviewCount}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
