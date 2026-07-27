function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold tracking-tight uppercase">
      {children}
    </h2>
  );
}

export default Title;
