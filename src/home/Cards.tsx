import { motion } from "motion/react";

import Electronics from "@/assets/gadgets.png";
import Gaming from "@/assets/gaming.png";
import Furnitures from "@/assets/funiture.png";
import Fashion from "@/assets/fashion.png";

const categories = [
  {
    image: Electronics,
    label: "Gadgets",
    position: "top-5 -left-25 lg:-left-10",
    rotation: "rotate-6",
    initial: { x: -80, y: -60 },
    delay: 0.2,
  },
  {
    image: Gaming,
    label: "Gaming",
    position: "bottom-5 -left-30 lg:-left-15",
    rotation: "rotate-[-5deg]",
    initial: { x: -80, y: 60 },
    delay: 0.35,
  },
  {
    image: Furnitures,
    label: "Furnitures",
    position: "top-5 -right-25 lg:-right-10",
    rotation: "-rotate-6",
    initial: { x: 80, y: -60 },
    delay: 0.25,
  },
  {
    image: Fashion,
    label: "Fashion",
    position: "bottom-5 -right-30 lg:-right-15",
    rotation: "rotate-[5deg]",
    initial: { x: 80, y: 60 },
    delay: 0.4,
  },
];

function Cards() {
  return (
    <>
      {categories.map((category) => (
        <motion.div
          key={category.label}
          className={`absolute hidden w-50 md:block lg:w-65 ${category.position}`}
          initial={{
            opacity: 0,
            scale: 0.3,
            ...category.initial,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: category.delay,
          }}
        >
          <div
            className={`${category.rotation} overflow-hidden rounded-2xl shadow-lg`}
          >
            <img
              src={category.image}
              alt={category.label}
              className="h-37.5 w-full object-cover"
            />

            <div className="bg-card px-3 py-2">
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                {category.label}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export default Cards;
