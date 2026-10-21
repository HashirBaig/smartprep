import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

import type { TYPES_ALERT_CARD_PROPS } from "@/lib/const";

function AlertCard({ title, description }: TYPES_ALERT_CARD_PROPS) {
  return (
    <Alert className="bg-green-800 text-green-50 my-2">
      <InfoIcon className="text-green-50" />
      <AlertTitle className="text-green-50">{title}</AlertTitle>
      <AlertDescription className="text-green-50/70">
        {description}
      </AlertDescription>
    </Alert>
  );
}

export default AlertCard;
