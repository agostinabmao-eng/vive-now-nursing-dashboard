import { DEFAULT_TIME_ALLOCATION } from "./utils";

export const ACTIVITY_STANDARD_TOOLTIPS = {
  callsMade: `Estimated: ${DEFAULT_TIME_ALLOCATION.callStandardMinutes} min per call made`,
  callsCompleted: `Estimated: ${DEFAULT_TIME_ALLOCATION.cptStandardMinutes} min per completed call`,
  smsSent: `Estimated: ${DEFAULT_TIME_ALLOCATION.smsStandardMinutes} min per SMS sent`,
} as const;

export const ESTIMATED_CARE_TIME_TOOLTIP =
  "Sum of estimated minutes from Calls Made, Calls Completed, and SMS Sent.";

export const PAID_TIME_TOOLTIP = "Total paid hours for the period.";

export const EFFICIENCY_TOOLTIP =
  "Estimated Care Time divided by Paid Time. Higher means more verified activity per paid hour.";
