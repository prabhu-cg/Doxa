import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A MacBook built from CSS around a 16:10 screenshot. The light and dark
 * captures swap with the theme in CSS alone, so there is no flash. The device
 * is a picture, so it is the one thing on the page with a deep shadow.
 */
export function MacbookMockup({
  lightSrc,
  darkSrc,
  alt,
  priority = false,
  className,
}: {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("mx-auto w-full max-w-5xl", className)}>
      <div className="device-shadow rounded-[22px] sm:rounded-[28px]">
        {/* Lid: the bezel, a camera dot, then the screen. */}
        <div className="rounded-t-[22px] bg-[#1b1a1a] p-[2.2%] pb-[2.4%] ring-1 ring-black/20 sm:rounded-t-[28px] dark:bg-[#2b2927] dark:ring-white/15">
          <div className="relative overflow-hidden rounded-[6px] bg-black sm:rounded-[10px]">
            <span
              aria-hidden="true"
              className="absolute top-0 left-1/2 z-10 h-[2.2%] w-[11%] -translate-x-1/2 rounded-b-[8px] bg-[#1b1a1a] dark:bg-[#2b2927]"
            />
            <Image
              src={lightSrc}
              alt={alt}
              width={2880}
              height={1800}
              sizes="(min-width: 1024px) 1000px, 100vw"
              priority={priority}
              className="block h-auto w-full dark:hidden"
            />
            <Image
              src={darkSrc}
              alt={alt}
              width={2880}
              height={1800}
              sizes="(min-width: 1024px) 1000px, 100vw"
              priority={priority}
              className="hidden h-auto w-full dark:block"
            />
          </div>
        </div>
        {/* Base: a thin aluminium deck with the finger notch. */}
        <div
          aria-hidden="true"
          className="relative mx-[-3.5%] h-[10px] rounded-b-[18px] bg-[#c9c5bd] sm:h-[14px] dark:bg-[#3d3a36]"
        >
          <span className="absolute top-0 left-1/2 h-[5px] w-[16%] -translate-x-1/2 rounded-b-[8px] bg-black/20 sm:h-[6px]" />
        </div>
      </div>
    </figure>
  );
}
