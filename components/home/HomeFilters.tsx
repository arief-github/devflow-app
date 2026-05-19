import { HomePageFilters } from "@/constants/filter";
import { Button } from "../ui/button";

const HomeFilters = () => {
  const active = "frequent";

  return (
    <div className="mt-10 hidden md:flex flex-wrap gap-3">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => {}}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${active === filter.value ? "bg-primary-100 text-primary-500" : "bg-light-800 text-light-500"}`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
