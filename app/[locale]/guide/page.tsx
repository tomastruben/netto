import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DICTS, LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { GUIDE } from "@/lib/guide-content";
import { CANTONS, CANTON_DATA, type Canton } from "@/lib/salary/cantons";
import { TAX_CURVES } from "@/lib/salary/tax-curves";
import { interpolateRate } from "@/lib/salary/interpolate";
import { pct } from "@/lib/format";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const g = GUIDE[locale];
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: {
      canonical: `/${locale}/guide`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/guide`])),
    },
  };
}

interface Row {
  canton: Canton;
  rate: number;
  rank: number;
}

/** Official burden at 100k gross per capital, from the embedded ESTV curves. */
function ranking(profile: "single" | "family"): Row[] {
  return CANTONS.map((canton) => ({
    canton,
    rate: interpolateRate(TAX_CURVES[canton][profile], 100_000),
  }))
    .sort((a, b) => a.rate - b.rate)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

function RankTable({
  caption,
  groups,
  locale,
  hrefFor,
}: {
  caption: string;
  groups: { label: string; rows: Row[] }[];
  locale: Locale;
  hrefFor: (canton: Canton) => string;
}) {
  return (
    <figure className="my-4 border">
      <figcaption className="microlabel border-b bg-secondary px-3 py-2">
        {caption}
      </figcaption>
      <table className="w-full text-sm">
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.label}>
              <tr className="border-b">
                <td
                  colSpan={3}
                  className="microlabel px-3 py-1.5 text-muted-foreground"
                >
                  {group.label}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.canton} className="border-b last:border-b-0">
                  <td className="num w-8 px-3 py-2 text-right text-muted-foreground">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={hrefFor(row.canton)}
                      className="underline-offset-2 hover:underline"
                    >
                      {CANTON_DATA[row.canton].names[locale]}
                    </Link>
                  </td>
                  <td className="num px-3 py-2 text-right">{pct(row.rate)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = DICTS[locale];
  const g = GUIDE[locale];

  const single = ranking("single");
  const family = ranking("family");

  const tableFor = (kind: "single" | "family") =>
    kind === "single" ? (
      <RankTable
        caption={g.tableSingle.caption}
        locale={locale}
        hrefFor={(c) => `/${locale}?c=${c}`}
        groups={[
          { label: g.cheapest, rows: single.slice(0, 3) },
          { label: g.priciest, rows: single.slice(-3) },
        ]}
      />
    ) : (
      <RankTable
        caption={g.tableFamily.caption}
        locale={locale}
        hrefFor={(c) => `/${locale}?c=${c}&m=1&k=2`}
        groups={[{ label: g.cheapest, rows: family.slice(0, 5) }]}
      />
    );

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 sm:px-8">
      <SiteHeader dict={dict} locale={locale} active="guide" />
      <main className="flex-1 py-8">
        <article className="rise rise-2 mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight">{g.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{g.intro}</p>

          <div className="mt-8 space-y-10">
            {g.sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-6">
                <div className="flex items-baseline gap-3 border-b pb-2">
                  <span className="num text-xs text-primary">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-base font-semibold">{section.heading}</h2>
                </div>
                <div className="mt-3 space-y-3 text-sm leading-relaxed">
                  <p>{section.body[0]}</p>
                  {section.table && tableFor(section.table)}
                  {section.body.slice(1).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
                {section.tryLabel && (
                  <p className="mt-3">
                    <Link
                      href={`/${locale}${section.tryQuery ?? ""}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {section.tryLabel} →
                    </Link>
                  </p>
                )}
              </section>
            ))}
          </div>

          <p className="mt-10 border-t pt-4 text-[11px] text-muted-foreground">
            {g.dataNote}
          </p>
        </article>
      </main>
      <SiteFooter dict={dict} />
    </div>
  );
}
