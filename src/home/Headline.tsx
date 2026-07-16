import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RotatingWords from "./RotatingWords";
import Logo from "@/components/Logo";

function Headline() {
  return (
    <motion.div
      className="relative z-10 mx-auto max-w-3xl space-y-5 text-center lg:space-y-7"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
        </span>
        For communities everywhere
      </motion.div>
      <h1 className="font-display text-foreground text-5xl leading-[0.95] font-bold tracking-[-0.035em] sm:text-6xl lg:text-[68px] 2xl:text-[80px]">
        The auction platform where unused items find new <RotatingWords />
      </h1>
      <p className="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed lg:text-xl">
        Whether it's electronics, furniture, fashion, collectibles, or everyday
        essentials, create auctions in minutes, discover great deals, and buy or
        sell with confidence, all in one place.
      </p>
      <Button
        size="sm"
        className="shadow-foreground/10 h-14 px-9 text-base font-semibold shadow-xl"
      >
        Get started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export default Headline;
