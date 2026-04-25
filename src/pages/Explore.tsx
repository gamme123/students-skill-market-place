import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { categories } from "@/data/services";
import { fetchMarketplaceServices } from "@/lib/marketplace";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCat, setActiveCat] = useState(searchParams.get("cat") || "");

  const { data, isLoading } = useQuery({
    queryKey: ["services", "explore"],
    queryFn: fetchMarketplaceServices,
  });

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setActiveCat(searchParams.get("cat") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const services = data ?? [];

    return services.filter((service) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        service.title.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery) ||
        service.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        service.category.toLowerCase().includes(normalizedQuery);

      const category = categories.find((item) => item.id === activeCat);
      const matchesCategory = !activeCat || service.category === category?.name;

      return matchesQuery && matchesCategory;
    });
  }, [activeCat, data, query]);

  const updateSearchParams = (nextQuery: string, nextCategory: string) => {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set("q", nextQuery.trim());
    if (nextCategory) next.set("cat", nextCategory);
    setSearchParams(next, { replace: true });
  };

  const handleCategoryClick = (categoryId: string) => {
    const nextCategory = activeCat === categoryId ? "" : categoryId;
    setActiveCat(nextCategory);
    updateSearchParams(query, nextCategory);
  };

  const activeCategoryName = categories.find((category) => category.id === activeCat)?.name;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Explore services</p>
              <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">Find the right student talent fast</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Search by skill, browse high-demand categories, and open detailed service pages backed by your Supabase marketplace data.
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> service{filtered.length === 1 ? "" : "s"}
              {activeCategoryName ? ` in ${activeCategoryName}` : ""} found
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search web development, tutoring, editing, design..."
                className="h-12 rounded-2xl pl-11"
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setQuery(nextQuery);
                  updateSearchParams(nextQuery, activeCat);
                }}
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Live filters
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={activeCat === category.id ? "default" : "secondary"}
                className="cursor-pointer rounded-full px-4 py-2 text-xs transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.icon} {category.name}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[340px] rounded-[1.75rem]" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-border bg-card px-6 py-16 text-center shadow-card">
              <h2 className="text-2xl font-bold text-foreground">No services matched this search</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Try another keyword, clear the category filter, or add new listings in Supabase so more results appear here.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
