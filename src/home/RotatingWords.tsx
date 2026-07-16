import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const rotatingWords = ["homes.", "buyers.", "owners.", "value."];

function RotatingWords() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  return (
    <span className="relative block">
      <AnimatePresence mode="wait">
        <motion.span
          key={rotatingWords[wordIndex]}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="text-primary inline-block italic"
        >
          {rotatingWords[wordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default RotatingWords;
