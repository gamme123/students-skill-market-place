import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/data/services";

const ServiceCard = ({ service }: { service: Service }) => (
  <Link
    to={`/service/${service.id}`}
    className="group block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
  >
    <div className="aspect-video w-full overflow-hidden bg-secondary">
      <div className="flex h-full items-center justify-center text-4xl">
        {service.category === "Web Development" && "💻"}
        {service.category === "Graphic Design" && "🎨"}
        {service.category === "Tutoring" && "📚"}
        {service.category === "Translation" && "🌍"}
        {service.category === "Programming Help" && "⚙️"}
        {service.category === "Video Editing" && "🎬"}
      </div>
    </div>

    <div className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {service.sellerAvatar}
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">{service.sellerName}</p>
          <p className="text-[10px] text-muted-foreground">{service.sellerUniversity}</p>
        </div>
      </div>

      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {service.title}
      </h3>

      <div className="mb-3 flex flex-wrap gap-1">
        {service.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-medium text-foreground">{service.rating}</span>
          <span>({service.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {service.deliveryDays}d
        </div>
      </div>

      <div className="mt-2 text-right">
        <span className="text-xs text-muted-foreground">From </span>
        <span className="text-base font-bold text-foreground">${service.price}</span>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
