import { Check, X } from "lucide-react";
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  PASSWORD_REQUIREMENTS,
} from "@/lib/auth-validation";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const requirementsList = [
    { key: "minLength", label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`, met: strength.requirements.minLength },
    { key: "hasUppercase", label: "One uppercase letter", met: strength.requirements.hasUppercase },
    { key: "hasLowercase", label: "One lowercase letter", met: strength.requirements.hasLowercase },
    { key: "hasNumber", label: "One number", met: strength.requirements.hasNumber },
    { key: "hasSpecialChar", label: "One special character (!@#$%^&*)", met: strength.requirements.hasSpecialChar },
  ];

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`capitalize font-medium ${
            strength.level === "weak" ? "text-destructive" :
            strength.level === "fair" ? "text-yellow-500" :
            strength.level === "good" ? "text-blue-500" :
            "text-green-500"
          }`}>
            {strength.level}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(strength.level)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirementsList.map((req) => (
          <div
            key={req.key}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
