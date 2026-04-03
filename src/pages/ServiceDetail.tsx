import { useParams, Link } from "react-router-dom";
import { Star, Clock, ArrowLeft, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { featuredServices } from "@/data/services";

const ServiceDetail = () => {
  const { id } = useParams();
  const service = featuredServices.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Service not found</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = [
    { name: "Jordan L.", rating: 5, text: "Exceeded expectations! Delivered early and the quality was amazing.", date: "2 weeks ago" },
    { name: "Priya K.", rating: 5, text: "Very professional and easy to work with. Will definitely order again.", date: "1 month ago" },
    { name: "Tom W.", rating: 4, text: "Good work overall. Communication could be a bit faster but results were solid.", date: "1 month ago" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-secondary text-6xl">
              {service.category === "Web Development" && "💻"}
              {service.category === "Graphic Design" && "🎨"}
              {service.category === "Tutoring" && "📚"}
              {service.category === "Translation" && "🌍"}
              {service.category === "Programming Help" && "⚙️"}
              {service.category === "Video Editing" && "🎬"}
            </div>

            <h1 className="mb-3 text-2xl font-bold text-foreground">{service.title}</h1>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-semibold text-foreground">{service.rating}</span>
                <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {service.deliveryDays} day delivery
              </div>
            </div>

            <p className="mb-6 text-muted-foreground">{service.description}</p>

            <div className="mb-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="mb-4 text-xl font-bold text-foreground">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {r.name[0]}
                        </div>
                        <span className="text-sm font-medium text-foreground">{r.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {service.sellerAvatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{service.sellerName}</p>
                  <p className="text-xs text-muted-foreground">{service.sellerUniversity}</p>
                </div>
              </div>

              <div className="mb-6 text-center">
                <span className="text-sm text-muted-foreground">Starting at</span>
                <p className="text-3xl font-bold text-foreground">${service.price}</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Order Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" /> Contact Seller
                </Button>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {service.deliveryDays}-day delivery</li>
                <li className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> {service.rating} rating</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
