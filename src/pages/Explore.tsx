import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { featuredServices, categories } from "@/data/services";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("cat") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeCat, setActiveCat] = useState(initialCat);

  const filtered = useMemo(() => {
    return featuredServices.filter((s) => {
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        s.category.toLowerCase().includes(query.toLowerCase());

      const cat = categories.find((c) => c.id === activeCat);
      const matchesCat = !activeCat || (cat && s.category === cat.name);

      return matchesQuery && matchesCat;
    });
  }, [query, activeCat]);

  const handleCatClick = (id: string) => {
    const next = activeCat === id ? "" : id;
    setActiveCat(next);
    if (next) searchParams.set("cat", next);
    else searchParams.delete("cat");
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Explore Services</h1>

        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={activeCat === cat.id ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
              onClick={() => handleCatClick(cat.id)}
            >
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">No services found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
