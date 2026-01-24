import { OptionLeg } from "@/lib/options-calculator";
import { PayoffChart } from "@/components/charts";

interface PayoffDiagramProps {
  legs: OptionLeg[];
  currentPrice: number;
  priceRange?: number;
}

export const PayoffDiagram = ({ legs, currentPrice, priceRange = 0.3 }: PayoffDiagramProps) => {
  return (
    <PayoffChart 
      legs={legs} 
      currentPrice={currentPrice} 
      priceRange={priceRange}
      height={256}
    />
  );
};
