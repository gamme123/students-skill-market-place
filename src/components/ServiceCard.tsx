import { Link } from "react-router-dom";
import { ArrowUpRight, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon, type Service } from "@/data/services";

const ServiceCard = ({ service }: { service: Service }) => (
  <Link
    to={`/service/${service.id}`}
    className="group block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
  >
    <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,white_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.16),transparent_26%)]" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
            {service.category}
          </Badge>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">
            {getCategoryIcon(service.category)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {service.sellerAvatar}
            </div>
            <div>
              <p className="font-medium text-foreground">{service.sellerName}</p>
              <p>{service.sellerUniversity}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>

    <div className="p-5">
      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {service.title}
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {service.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full border-dashed px-2.5 py-1 text-[11px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-medium text-foreground">{service.rating}</span>
            <span>({service.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {service.deliveryDays}d
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">From </span>
          <span className="text-lg font-bold text-foreground">${service.price}</span>
        </div>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
