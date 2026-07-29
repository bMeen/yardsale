function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold tracking-tight uppercase md:text-2xl">
      {children}
    </h2>
  );
}

export default Title;
