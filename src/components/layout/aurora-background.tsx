"use client";

import { usePathname } from "next/navigation";

/**
 * Decorative, fixed full-viewport backdrop: three large blurred color
 * blobs drifting slowly behind the page content. Purely visual — no
 * layout footprint (`pointer-events-none`, negative z-index) so it can't
 * shift or intercept anything in the existing page structure. Skipped on
 * `/admin` — the storefront gets the "aurora" treatment, the admin panel
 * stays as a plain, distraction-free work tool.
 */
export function AuroraBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-[12%] -top-[18%] h-[55vw] w-[55vw] max-h-[620px] max-w-[620px] rounded-full opacity-30 blur-[110px] dark:opacity-45"
        style={{
          background: "radial-gradient(circle, hsl(var(--aurora-1)) 0%, transparent 70%)",
          animation: "aurora-float-a 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-[14%] top-[2%] h-[50vw] w-[50vw] max-h-[560px] max-w-[560px] rounded-full opacity-25 blur-[110px] dark:opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(var(--aurora-2)) 0%, transparent 70%)",
          animation: "aurora-float-b 28s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[22%] top-[20%] h-[42vw] w-[42vw] max-h-[480px] max-w-[480px] rounded-full opacity-20 blur-[110px] dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(var(--aurora-3)) 0%, transparent 70%)",
          animation: "aurora-float-c 32s ease-in-out infinite",
        }}
      />
    </div>
  );
}
