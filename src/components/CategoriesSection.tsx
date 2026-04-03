import { Link } from "react-router-dom";
import { categories } from "@/data/services";

const CategoriesSection = () => (
  <section className="bg-secondary/50 py-16">
    <div className="container mx-auto px-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
        <p className="mt-2 text-muted-foreground">Find the skill you need from fellow students</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/explore?cat=${cat.id}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.count} services</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
