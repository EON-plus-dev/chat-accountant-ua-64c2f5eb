import { InlineCalculator } from "@/portal/components/InlineCalculator";
import type { CalculatorData } from "@/portal/types/hub";

interface Props {
  data: CalculatorData;
}

export const CalculatorSection = ({ data }: Props) => (
  <InlineCalculator type={data.calcType} />
);
