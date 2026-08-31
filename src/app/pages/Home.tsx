import BackgroundGlow from "../../home/BackgroundGlow";
import Cards from "../../home/Cards";
import ConfettiLayer from "../../home/ConfettiLayer";
import Headline from "../../home/Headline";

function Hero() {
  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <section className="relative overflow-hidden">
        <BackgroundGlow />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="relative flex min-h-150 items-center justify-center">
            <ConfettiLayer />
            <Cards />
            <Headline />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
