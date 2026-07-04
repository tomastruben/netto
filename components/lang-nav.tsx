"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n";

/** Language switcher that keeps the current page and calculator state (query) across locales. */
export function LangNav({ current }: { current: Locale }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const qs = searchParams.toString();
  const suffix = `${rest}${qs ? `?${qs}` : ""}`;

  return (
    <nav aria-label="Language" className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${suffix}`}
          className={`px-2 py-1 text-xs font-medium uppercase tracking-widest transition-colors ${
            l === current
              ? "text-primary underline decoration-2 underline-offset-4"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}
