function BackgroundGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0"
      aria-hidden="true"
    >
      <div className="mx-auto h-180 w-[120%] translate-x-[-10%] bg-[radial-gradient(ellipse_at_50%_0%,hsl(20_80%_90%/_0.8)_0%,hsl(20_75%_95%/_0.45)_38%,transparent_72%)]" />
    </div>
  );
}

export default BackgroundGlow;
