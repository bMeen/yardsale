function ProfileActivityStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        ["2", "Active\nAuctions"],
        ["1", "Items\nSold"],
        ["1", "Items\nWon"],
      ].map(([n, l]) => (
        <div key={l} className="bg-card rounded-2xl p-4 text-center shadow-xs">
          <p className="font-display text-xl font-bold md:text-3xl">{n}</p>
          <p className="text-muted-foreground mt-1 text-xs leading-tight whitespace-pre-line">
            {l}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ProfileActivityStats;
