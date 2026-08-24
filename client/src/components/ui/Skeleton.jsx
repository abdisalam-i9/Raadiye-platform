import { cn } from '../../utils/cn';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton-shimmer rounded-xl', className)} />;
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-line bg-paper">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-[1.15rem] border border-line bg-paper p-4">
      <Skeleton className="mx-auto size-14 rounded-2xl" />
      <Skeleton className="mx-auto mt-3 h-4 w-20" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-line bg-paper">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-line py-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}
