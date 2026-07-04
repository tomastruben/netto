"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import type { Dict } from "@/lib/i18n";

/**
 * Reserved monetization surfaces, v1 = placeholders.
 * Affiliate cards target the verticals proven by competitors
 * (pillar 3a, health insurance, relocation); the ad box is a
 * standard 728×90-capable slot to be wired to an ad server later.
 */
export function Monetize({ dict }: { dict: Dict }) {
  const t = dict.monetize;
  const cards = [
    { title: t.pillar3aTitle, desc: t.pillar3aDesc, cta: t.pillar3aCta },
    { title: t.healthTitle, desc: t.healthDesc, cta: t.healthCta },
    { title: t.relocationTitle, desc: t.relocationDesc, cta: t.relocationCta },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="microlabel border-b pb-3">{t.partnerLabel}</h2>
        <ItemGroup className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((c) => (
            <Item key={c.title} variant="outline" className="flex-col items-start gap-3">
              <ItemContent>
                <ItemTitle>{c.title}</ItemTitle>
                <ItemDescription className="text-xs">{c.desc}</ItemDescription>
              </ItemContent>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                {c.cta}
                <ArrowUpRight />
              </Button>
            </Item>
          ))}
        </ItemGroup>
      </div>

      <div
        aria-hidden
        className="flex h-24 items-center justify-center border border-dashed"
      >
        <span className="microlabel">{t.adLabel}</span>
      </div>
    </section>
  );
}
