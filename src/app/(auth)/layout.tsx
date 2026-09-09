import Link from "next/link";

const WHITE_LOGO_FILTER = { filter: "brightness(0) invert(1)" };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <div className="flex flex-1">
        <div className="bg-primary relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[58%]">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex translate-x-1/2 items-center select-none"
            aria-hidden="true"
          >
            <img
              src="/doxa-logo.svg"
              alt=""
              className="h-full w-auto opacity-15"
              style={WHITE_LOGO_FILTER}
            />
          </div>

          <Link href="/" className="relative flex items-center gap-3">
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
              className="mb-0 -ml-3 block leading-none text-white/15 select-none"
              style={{ fontSize: "10rem", lineHeight: 1 }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="-mt-6 text-[1.6rem] leading-snug font-semibold text-white">
              Feedback isn&apos;t a to-do list. It&apos;s a conversation waiting
              for a reply.
            </blockquote>
            <p className="mt-5 text-sm font-medium tracking-wide text-white/60">
              — The Doxa loop
            </p>
          </div>

          <p className="relative text-xs text-white/40">
            © {year} Doxa. All rights reserved.
          </p>
        </div>

        <div className="bg-muted flex flex-1 flex-col items-center justify-center px-6 py-8 sm:py-12">
          <div className="w-full max-w-sm">
            <Link href="/" className="mb-6 flex flex-col items-center sm:mb-8">
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
