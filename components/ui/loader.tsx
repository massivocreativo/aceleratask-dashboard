"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoaderProps {
    className?: string;
    size?: number;
}

export function Loader({ className, size = 100 }: LoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center animate-pulse", className)}>
            <div className="relative overflow-hidden">
                <Image
                    src="/turtle-loader.png"
                    alt="Loading..."
                    width={size}
                    height={size}
                    className="object-contain filter grayscale contrast-200 brightness-0 scale-x-[-1]"
                    priority
                />
            </div>
        </div>
    );
}
