function AdminHeader({
  title,
  subtitle,
  includeLive,
}: {
  title: string;
  subtitle: string;
  includeLive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-[2rem] leading-none font-bold tracking-tight uppercase">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      </div>
      {includeLive && (
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </div>
      )}
    </div>
  );
}

export default AdminHeader;
