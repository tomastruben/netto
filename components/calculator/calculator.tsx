"use client";

import * as React from "react";
import { calcSalary } from "@/lib/salary/engine";
import {
  DEFAULT_STATE,
  applyPatch,
  readUrlState,
  writeUrlState,
  type CalcState,
} from "@/lib/calc-state";
import type { Dict, Locale } from "@/lib/i18n";
import { SalaryForm } from "./salary-form";
import { Results } from "./results";
import { CantonCompare } from "./canton-compare";
import { Monetize } from "./monetize";

export type { CalcState };

export function Calculator({ dict, locale }: { dict: Dict; locale: Locale }) {
  const [state, setState] = React.useState<CalcState>(DEFAULT_STATE);
  const interacted = React.useRef(false);

  // Hydrate from the share URL once, after mount (avoids SSR mismatch).
  React.useEffect(() => {
    const fromUrl = readUrlState();
    if (Object.keys(fromUrl).length === 0) return;
    setState((s) => applyPatch(s, fromUrl));
  }, []);

  // Mirror state into the URL, but only after the user actually changed
  // something — as a post-render effect, never during render (the router
  // listens to history.replaceState).
  React.useEffect(() => {
    if (!interacted.current) return;
    writeUrlState(state);
  }, [state]);

  const update = React.useCallback((patch: Partial<CalcState>) => {
    interacted.current = true;
    setState((prev) => applyPatch(prev, patch));
  }, []);

  const result = React.useMemo(() => calcSalary(state), [state]);

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
      <div className="rise rise-2 lg:col-span-5 xl:col-span-4">
        <SalaryForm dict={dict} locale={locale} state={state} onChange={update} />
      </div>
      <div className="flex flex-col gap-8 lg:col-span-7 xl:col-span-8">
        <div className="rise rise-3">
          <Results dict={dict} state={state} result={result} />
        </div>
        <div className="rise rise-4">
          <CantonCompare dict={dict} state={state} locale={locale} />
        </div>
        <div className="rise rise-5">
          <Monetize dict={dict} />
        </div>
      </div>
    </div>
  );
}
