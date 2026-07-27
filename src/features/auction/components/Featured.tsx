import FeaturedCard from "./FeaturedCard";

function Featured() {
  return (
    <ul className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-2">
      {[1, 2, 3].map((i) => (
        <li key={i}>
          <FeaturedCard />
        </li>
      ))}
    </ul>
  );
}

export default Featured;
