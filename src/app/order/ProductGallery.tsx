"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";

/** Swipeable 4:5 photo gallery with dots and thumbnails. */
export function ProductGallery() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-neutral-200 bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {P.images.map((img, i) => (
          <div key={img.src} className="relative aspect-[4/5] w-full shrink-0 snap-center">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {P.images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {P.images.map((img, i) => (
            <button
              type="button"
              key={img.src}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`relative h-16 w-[3.2rem] overflow-hidden rounded-md border-2 ${
                i === index ? "border-tribe" : "border-transparent opacity-70"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="52px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
