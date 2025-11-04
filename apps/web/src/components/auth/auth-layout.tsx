import { PropsWithChildren } from "react";

type AuthLayoutProps = PropsWithChildren<{
  maxWidthClassName?: string;
}>;

export function AuthLayout({ children, maxWidthClassName = "max-w-md" }: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-svh overflow-hidden">
      {/* Soft mint–aqua gradient background with blurred glow shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-emerald-300/30 blur-[100px] dark:bg-emerald-400/20" />
        <div className="absolute -bottom-28 -right-20 h-[560px] w-[560px] rounded-full bg-teal-300/30 blur-[120px] dark:bg-teal-400/20" />
        <div className="absolute right-1/4 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-300/20 blur-[100px] dark:bg-cyan-500/15" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/20 to-white/40 dark:from-transparent dark:via-black/10 dark:to-black/20" />
      </div>

      <section className={`mx-auto w-full px-4 sm:px-6 lg:px-8 flex min-h-svh items-center justify-center`}>
        <div className={`w-full ${maxWidthClassName}`}>
          {children}
        </div>
      </section>
    </main>
  );
}
