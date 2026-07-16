function Logo({ className }: { className?: string }) {
  return (
    <p
      className={`font-logo text-primary text-3xl tracking-widest uppercase md:text-5xl lg:text-6xl ${className}`}
    >
      yardsale
    </p>
  );
}

export default Logo;
