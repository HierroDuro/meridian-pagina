export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "Hoy", "Ayer", or a short localized date for anything older. */
export function formatDayLabel(date: Date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return "Hoy";
  if (isSameDay(date, yesterday)) return "Ayer";

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}

export function DaySeparator({ date }: { date: Date }) {
  return (
    <div className="my-4 flex items-center justify-center">
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {formatDayLabel(date)}
      </span>
    </div>
  );
}
