import Image from "next/image";
import Link from "next/link";

const WHITE_LOGO_FILTER = { filter: "brightness(0) invert(1)" };

/**
 * Doxa's own panel on the sign-in and sign-up pages: a photograph of a terracotta wall
 * in low sun with the logo, the quote and the copyright over it. A terracotta tint
 * and a dark scrim keep the white text readable on every part of the image.
 * Only shown from `lg` up, and not at all when the page belongs to an
 * organisation (see `AuthFrame`).
 */
export function AuthAside() {
  const year = new Date().getFullYear();

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#3a1605] p-12 lg:flex lg:w-[58%]">
      <Image
        src="/auth/panel.jpg"
        alt=""
        fill
        priority
        sizes="58vw"
        className="object-cover object-[30%_62%]"
      />
      <div
        aria-hidden="true"
        className="bg-primary absolute inset-0 opacity-35 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#180902]/62 via-[#180902]/38 via-52% to-[#180902]/86"
      />

      <Link href="/" className="relative flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG asset, next/image adds no benefit here */}
        <img
          src="/doxa-logo.svg"
          alt=""
          className="h-8 w-auto"
          style={WHITE_LOGO_FILTER}
        />
        <span className="text-xl font-bold tracking-tight text-white">
          Doxa
        </span>
      </Link>

      <div className="relative max-w-lg">
        <span
          className="mb-0 -ml-3 block leading-none text-white/20 select-none"
          style={{ fontSize: "10rem", lineHeight: 1 }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <blockquote className="-mt-6 text-[1.6rem] leading-snug font-semibold text-white [text-shadow:0_1px_14px_rgb(0_0_0/0.35)]">
          Feedback isn&apos;t a to-do list. It&apos;s a conversation waiting for
          a reply.
        </blockquote>
        <p className="mt-5 text-sm font-medium tracking-wide text-white/75">
          — The Doxa loop
        </p>
      </div>

      <p className="relative text-xs text-white/60">
        © {year} Doxa. All rights reserved.
      </p>
    </div>
  );
}

/** Doxa's logo, name and tagline above the form, shown where the panel is not
 * (small screens) and on every sign-in that isn't an organisation's. */
export function AuthFormLogo() {
  return (
    <Link href="/" className="mb-6 flex flex-col items-center sm:mb-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG asset, next/image adds no benefit here */}
      <img
        src="/doxa-logo.svg"
        alt=""
        className="mb-2 h-10 w-auto sm:mb-3 sm:h-14"
      />
      <h1 className="text-2xl font-bold tracking-tight">Doxa</h1>
      <p className="text-muted-foreground mt-1.5 text-sm">
        Listen. Understand. Decide.
      </p>
    </Link>
  );
}
