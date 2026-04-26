import { Link } from "react-router-dom";
import { categories } from "@/data/services";

const CategoriesSection = () => (
  <section className="bg-secondary/55 py-20">
    <div className="container mx-auto px-4">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Popular paths</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">Browse globally relevant categories</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Explore high-demand academic, creative, technical, and business skills designed to feel useful to local buyers, remote clients, and international teams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {categories.slice(0, 10).map((category) => (
          <Link
            key={category.id}
            to={`/explore?cat=${category.id}`}
            className="group rounded-[1.5rem] border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl transition-transform duration-300 group-hover:scale-110">
              {category.icon}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">{category.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{category.count}+ active listings</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
