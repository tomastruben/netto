import { Suspense } from "react";
import Link from "next/link";
import { LangNav } from "@/components/lang-nav";
import type { Dict, Locale } from "@/lib/i18n";

/** Red square + white equals: abstract flag, concrete math. */
export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${className} inline-flex shrink-0 flex-col items-center justify-center gap-[3px] bg-primary`}
    >
      <span className="h-[2.5px] w-[46%] bg-primary-foreground" />
      <span className="h-[2.5px] w-[46%] bg-primary-foreground" />
    </span>
  );
}

export function SiteHeader({
  dict,
  locale,
  active,
}: {
  dict: Dict;
  locale: Locale;
  active: "calculator" | "guide";
}) {
  const pageLink = (page: "calculator" | "guide") =>
    `px-2 py-1 text-xs font-medium uppercase tracking-widest transition-colors ${
      active === page
        ? "text-primary underline decoration-2 underline-offset-4"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="rise rise-1 flex items-baseline justify-between border-b py-5">
      <Link href={`/${locale}`} className="flex items-center gap-3">
        <Mark />
        <span className="text-xl font-bold tracking-tight">netto.</span>
      </Link>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1">
          <Link href={`/${locale}`} className={pageLink("calculator")}>
            {dict.nav.calculator}
          </Link>
          <Link href={`/${locale}/guide`} className={pageLink("guide")}>
            {dict.nav.guide}
          </Link>
        </nav>
        <span aria-hidden className="h-4 w-px bg-border" />
        <Suspense fallback={<div className="h-6 w-32" aria-hidden />}>
          <LangNav current={locale} />
        </Suspense>
      </div>
    </header>
  );
}

export function SiteFooter({ dict }: { dict: Dict }) {
  return (
    <footer className="space-y-2 border-t py-6 text-xs text-muted-foreground">
      <p>{dict.footer.disclaimer}</p>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-medium text-foreground">{dict.footer.year}</span>
        <span>{dict.footer.sources}</span>
        <a
          href="https://swisstaxcalculator.estv.admin.ch"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {dict.footer.official}
        </a>
        <span className="ml-auto inline-flex items-center gap-2">
          <Mark className="size-3" />
          {dict.footer.madeIn}
        </span>
      </p>
    </footer>
  );
}
