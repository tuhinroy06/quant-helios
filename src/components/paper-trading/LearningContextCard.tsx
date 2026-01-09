import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const LearningContextCard = () => {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Why Paper Trading?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paper trading allows you to practice trading strategies without risking real money. 
              Every trade you make here uses virtual funds, helping you:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside pl-1">
              <li>Understand how your strategies perform in different market conditions</li>
              <li>Learn risk management through mandatory stop-losses</li>
              <li>Build discipline before moving to live trading</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
