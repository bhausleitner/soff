import { useRouter } from "next/router";
import { useState } from "react";
import { DiffBadge } from "~/components/common/DiffBadge";
import { Separator } from "~/components/ui/separator";

interface Quotes {
  quote1?: string | string[] | null;
  quote2?: string | string[] | null;
  quote3?: string | string[] | null;
}

export default function Compare() {
  const router = useRouter();
  const { ids } = router.query;

  const [quotes, setQuotes] = useState<Quotes>({});

  // Handle different cases for ids: array of strings, single string, or undefined
  let idArray: number[] = [];

  if (typeof ids === "string") {
    // If ids is a single string (e.g., "1", "1,2,3", or "1,")
    idArray = ids
      .split(",")
      .filter(Boolean) // removes any empty strings from the split
      .map((id) => Number(id));
  }

  return (
    <div>
      <h1>Compare Quotes</h1>
      <ul>
        {idArray.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
      <Separator />
      <div className="flex w-full flex-col items-start">
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 self-stretch pb-4 pl-4 pr-4 pt-4" />
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1 self-stretch rounded bg-neutral-50 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Precision TK
            </span>
            <span className="text-caption font-caption text-subtext-color">
              V-21481
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1 self-stretch rounded bg-neutral-50 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Subframe Manu
            </span>
            <span className="text-caption font-caption text-subtext-color">
              V-2578
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1 self-stretch rounded bg-neutral-50 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Fisher Dynamics
            </span>
            <span className="text-caption font-caption text-subtext-color">
              V-2578
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Part Unit Cost
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={8} />
            <span className="text-body-bold font-body-bold text-default-font">
              $1.73
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1.89
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1.89
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Materials Fee
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $900.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={50} />
            <span className="text-body-bold font-body-bold text-default-font">
              $450.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $900.00
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Processing Fee
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $415.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={10} />
            <span className="text-body-bold font-body-bold text-default-font">
              $360.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $415.00
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Subtotal
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={5} />
            <span className="text-body-bold font-body-bold text-default-font">
              $14,290.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $14,985.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $14,985.00
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Shipping
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1,000.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={20} />
            <span className="text-body-bold font-body-bold text-default-font">
              $800.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1,000.00
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Tax
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1,942.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1,942.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-body-bold font-body-bold text-default-font">
              $1,942.00
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-4 rounded bg-neutral-50">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6 pb-4 pl-4 pr-4 pt-4">
            <span className="text-caption-bold font-caption-bold text-subtext-color">
              Total
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <DiffBadge number={3} />
            <span className="text-heading-3 font-heading-3 text-default-font">
              $17,232.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-heading-3 font-heading-3 text-default-font">
              $17,727.00
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2 pb-4 pl-4 pr-4 pt-4">
            <span className="text-heading-3 font-heading-3 text-default-font">
              $17,727.00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
