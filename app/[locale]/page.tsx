import { notFound } from "next/navigation";
import { Calculator } from "@/components/calculator/calculator";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DICTS, isLocale } from "@/lib/i18n";

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
      <SiteHeader dict={dict} locale={locale} active="calculator" />
      <main className="flex-1 py-8">
        <Calculator dict={dict} locale={locale} />
      </main>
      <SiteFooter dict={dict} />
    </div>
  );
}
