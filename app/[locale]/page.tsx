import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Calculator } from "@/components/calculator/calculator";
import { LangNav } from "@/components/lang-nav";
import { DICTS, isLocale } from "@/lib/i18n";

/** Red square + white equals: abstract flag, concrete math. */
function Mark({ className = "size-7" }: { className?: string }) {
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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = DICTS[locale];

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 sm:px-8">
      <header className="rise rise-1 flex items-baseline justify-between border-b py-5">
        <div className="flex items-center gap-3">
          <Mark />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight">netto.</span>
            <span className="microlabel mt-1 hidden sm:block">
              {dict.header.tagline}
            </span>
          </div>
        </div>
        <Suspense
          fallback={<div className="h-6 w-32" aria-hidden />}
        >
          <LangNav current={locale} />
        </Suspense>
      </header>

      <main className="flex-1 py-8">
        <Calculator dict={dict} locale={locale} />
      </main>

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
    </div>
  );
}
