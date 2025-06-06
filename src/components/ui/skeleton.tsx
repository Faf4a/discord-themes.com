import { cn } from "@lib/utils";
import { HTMLAttributes } from "react";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-lg bg-primary/10", className)} {...props} />;
}

export { Skeleton };
