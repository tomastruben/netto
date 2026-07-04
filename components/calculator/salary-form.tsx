"use client";

import * as React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Minus, Plus } from "lucide-react";
import { CANTONS, CANTON_DATA } from "@/lib/salary/cantons";
import type { Dict, Locale } from "@/lib/i18n";
import type { CalcState } from "./calculator";

const AGE_BANDS = [
  { value: "u25", age: 22, label: "18–24", credit: "—" },
  { value: "25", age: 30, label: "25–34", credit: "7%" },
  { value: "35", age: 40, label: "35–44", credit: "10%" },
  { value: "45", age: 50, label: "45–54", credit: "15%" },
  { value: "55", age: 60, label: "55–65", credit: "18%" },
] as const;

function bandFor(age: number) {
  if (age < 25) return "u25";
  if (age < 35) return "25";
  if (age < 45) return "35";
  if (age < 55) return "45";
  return "55";
}

export function SalaryForm({
  dict,
  locale,
  state,
  onChange,
}: {
  dict: Dict;
  locale: Locale;
  state: CalcState;
  onChange: (patch: Partial<CalcState>) => void;
}) {
  const t = dict.form;
  const churchMode = CANTON_DATA[state.canton].churchMode;

  return (
    <FieldSet className="lg:sticky lg:top-6">
      <FieldLegend className="microlabel border-b pb-3">{t.legend}</FieldLegend>
      <FieldGroup className="gap-5">
        {/* Gross salary + period */}
        <Field>
          <FieldLabel htmlFor="gross">{t.gross}</FieldLabel>
          <div className="flex gap-2">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <InputGroupText className="num text-xs">CHF</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="gross"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                className="num text-base font-medium"
                value={state.grossValue || ""}
                onChange={(e) =>
                  onChange({ grossValue: Math.max(0, Number(e.target.value)) })
                }
              />
            </InputGroup>
            <ToggleGroup
              variant="outline"
              value={[state.inputPeriod]}
              onValueChange={(v: string[]) =>
                v[0] && onChange({ inputPeriod: v[0] as "month" | "year" })
              }
            >
              <ToggleGroupItem value="month" className="px-3 text-xs">
                {t.monthly}
              </ToggleGroupItem>
              <ToggleGroupItem value="year" className="px-3 text-xs">
                {t.annual}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="t13">{t.thirteenth}</FieldLabel>
            <FieldDescription>{t.thirteenthHint}</FieldDescription>
          </FieldContent>
          <Switch
            id="t13"
            checked={state.has13th}
            onCheckedChange={(v) => onChange({ has13th: v })}
          />
        </Field>

        {/* Canton */}
        <Field>
          <FieldLabel htmlFor="canton">{t.canton}</FieldLabel>
          <Select
            value={state.canton}
            onValueChange={(v) => onChange({ canton: v as CalcState["canton"] })}
          >
            <SelectTrigger id="canton" className="w-full">
              <SelectValue placeholder={t.cantonPlaceholder}>
                <span>
                  <span className="num mr-1.5 text-xs text-muted-foreground">
                    {state.canton}
                  </span>
                  {CANTON_DATA[state.canton].names[locale]}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CANTONS.map((c) => (
                <SelectItem key={c} value={c}>
                  <span className="num mr-1 text-xs text-muted-foreground">
                    {c}
                  </span>
                  {CANTON_DATA[c].names[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Age band */}
        <Field>
          <FieldLabel htmlFor="age">{t.age}</FieldLabel>
          <ToggleGroup
            variant="outline"
            className="w-full"
            value={[bandFor(state.age)]}
            onValueChange={(v: string[]) => {
              const band = AGE_BANDS.find((b) => b.value === v[0]);
              if (band) onChange({ age: band.age });
            }}
          >
            {AGE_BANDS.map((b) => (
              <ToggleGroupItem
                key={b.value}
                value={b.value}
                className="num flex-1 px-1 text-[11px]"
              >
                {b.value === "u25" ? t.ageUnder25 : b.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        {/* Marital + double income */}
        <Field>
          <FieldLabel>{t.marital}</FieldLabel>
          <ToggleGroup
            variant="outline"
            className="w-full"
            value={[state.married ? "married" : "single"]}
            onValueChange={(v: string[]) => {
              if (!v[0]) return;
              const married = v[0] === "married";
              onChange({ married, doubleIncome: married && state.doubleIncome });
            }}
          >
            <ToggleGroupItem value="single" className="flex-1 text-xs">
              {t.single}
            </ToggleGroupItem>
            <ToggleGroupItem value="married" className="flex-1 text-xs">
              {t.married}
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {state.married && (
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="dual">{t.doubleIncome}</FieldLabel>
              <FieldDescription>{t.doubleIncomeHint}</FieldDescription>
            </FieldContent>
            <Switch
              id="dual"
              checked={state.doubleIncome}
              onCheckedChange={(v) => onChange({ doubleIncome: v })}
            />
          </Field>
        )}

        {/* Children stepper */}
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>{t.children}</FieldLabel>
            <FieldDescription>{t.childrenHint}</FieldDescription>
          </FieldContent>
          <ButtonGroup>
            <Button
              variant="outline"
              size="icon"
              aria-label="−1"
              disabled={state.children <= 0}
              onClick={() => onChange({ children: state.children - 1 })}
            >
              <Minus />
            </Button>
            <ButtonGroupText className="num min-w-9 justify-center text-sm">
              {state.children}
            </ButtonGroupText>
            <Button
              variant="outline"
              size="icon"
              aria-label="+1"
              disabled={state.children >= 8}
              onClick={() => onChange({ children: state.children + 1 })}
            >
              <Plus />
            </Button>
          </ButtonGroup>
        </Field>

        {/* Church */}
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="church">{t.church}</FieldLabel>
            <FieldDescription>
              {churchMode === "none"
                ? t.churchNone
                : churchMode === "always"
                  ? t.churchAlways
                  : t.churchHint}
            </FieldDescription>
          </FieldContent>
          <Switch
            id="church"
            disabled={churchMode !== "optional"}
            checked={
              churchMode === "always"
                ? true
                : churchMode === "none"
                  ? false
                  : state.churchMember
            }
            onCheckedChange={(v) => onChange({ churchMember: v })}
          />
        </Field>

        {/* Permit */}
        <Field>
          <FieldLabel>{t.permit}</FieldLabel>
          <ToggleGroup
            variant="outline"
            className="w-full"
            value={[state.quellensteuer ? "bl" : "ch"]}
            onValueChange={(v: string[]) =>
              v[0] && onChange({ quellensteuer: v[0] === "bl" })
            }
          >
            <ToggleGroupItem value="ch" className="flex-1 text-xs">
              {t.permitCH}
            </ToggleGroupItem>
            <ToggleGroupItem value="bl" className="flex-1 text-xs">
              {t.permitBL}
            </ToggleGroupItem>
          </ToggleGroup>
          <FieldDescription>{t.permitHint}</FieldDescription>
        </Field>

        {/* Advanced */}
        <Accordion>
          <AccordionItem className="border-t border-b-0">
            <AccordionTrigger className="microlabel py-3 hover:no-underline">
              {t.advanced}
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pt-1">
              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel>{t.nbu}</FieldLabel>
                  <span className="num text-xs">
                    {(state.nbuRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Slider
                  min={0.7}
                  max={1.7}
                  step={0.1}
                  value={state.nbuRate * 100}
                  onValueChange={(v) =>
                    onChange({ nbuRate: (Array.isArray(v) ? v[0] : v) / 100 })
                  }
                />
                <FieldDescription>{t.nbuHint}</FieldDescription>
              </Field>
              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel>{t.ktg}</FieldLabel>
                  <span className="num text-xs">
                    {(state.ktgRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1.5}
                  step={0.1}
                  value={state.ktgRate * 100}
                  onValueChange={(v) =>
                    onChange({ ktgRate: (Array.isArray(v) ? v[0] : v) / 100 })
                  }
                />
                <FieldDescription>{t.ktgHint}</FieldDescription>
              </Field>
              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel>{t.bvgShare}</FieldLabel>
                  <span className="num text-xs">
                    {Math.round(state.bvgEmployeeShare * 100)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={5}
                  value={state.bvgEmployeeShare * 100}
                  onValueChange={(v) =>
                    onChange({
                      bvgEmployeeShare: (Array.isArray(v) ? v[0] : v) / 100,
                    })
                  }
                />
                <FieldDescription>{t.bvgShareHint}</FieldDescription>
              </Field>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FieldGroup>
    </FieldSet>
  );
}
