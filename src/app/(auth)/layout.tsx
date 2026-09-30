import { Suspense } from "react";
import { AuthFrame, AuthFrameView } from "@/components/auth/auth-frame";
import { AuthAside, AuthFormLogo } from "@/components/auth/auth-aside";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      {/* Reading the URL needs Suspense at build time; until then (and only then)
          the frame is Doxa's own, which is what every non-organisation sign-in is. */}
      <Suspense
        fallback={
          <AuthFrameView
            branded={false}
            aside={<AuthAside />}
            logo={<AuthFormLogo />}
          >
            {children}
          </AuthFrameView>
        }
      >
        <AuthFrame aside={<AuthAside />} logo={<AuthFormLogo />}>
          {children}
        </AuthFrame>
      </Suspense>
    </div>
  );
}
