import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Skeleton className="h-[250px] w-full rounded-xl mb-2" />
      <Skeleton className="h-8 w-full rounded-xl" />
    </div>
  );
}
