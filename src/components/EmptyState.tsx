import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Empty
      className={`border-muted-foreground border-2 border-dashed ${className}`}
    >
      <EmptyHeader>
        <EmptyMedia variant="default">{icon}</EmptyMedia>
        <EmptyTitle className="md:text-base">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default EmptyState;
