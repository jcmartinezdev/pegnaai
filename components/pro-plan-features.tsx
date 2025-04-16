import { getProLimits } from "@/db/queries";
import { Check } from "lucide-react";

export default function ProPlanFeatures() {
  const proLimits = getProLimits();

  return (
    <ul className="space-y-3">
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>Access to all available AI models</span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>{proLimits.messagesLimit} messages per month</span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>
          {proLimits.premiumMessagesLimit} premium model messages per month
        </span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>Access to Pegna AI Writer.</span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>
          Access to advanced features like web search, high reasoning, and image
          generation.
        </span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>Priority support</span>
      </li>
      <li className="flex items-center">
        <div className="mr-3 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span>Advanced customization options</span>
      </li>
    </ul>
  );
}
