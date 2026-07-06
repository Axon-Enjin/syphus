import { Card, Skeleton } from "@/components/ui";

export default function OnboardLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card title="Loading">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </Card>
      <Card title="Loading">
        <Skeleton className="h-20 w-full" />
      </Card>
    </div>
  );
}
