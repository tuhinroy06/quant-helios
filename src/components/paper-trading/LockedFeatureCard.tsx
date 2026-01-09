import { Lock, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Requirement {
  label: string;
  met: boolean;
}

interface LockedFeatureCardProps {
  title: string;
  description: string;
  requirements: Requirement[];
  targetPath?: string;
  isUnlocked: boolean;
}

export const LockedFeatureCard = ({
  title,
  description,
  requirements,
  targetPath,
  isUnlocked,
}: LockedFeatureCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`border-border/50 ${isUnlocked ? "bg-card" : "bg-card/30"}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            isUnlocked ? "bg-primary/10" : "bg-secondary"
          }`}>
            <Lock className={`h-5 w-5 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Requirements to unlock
              </p>
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {isUnlocked && targetPath && (
              <Button 
                onClick={() => navigate(targetPath)} 
                className="mt-2"
                size="sm"
              >
                Explore Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
