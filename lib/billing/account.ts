/**
 * Get the plan name from the plan code
 */
export function getPlanName(plan: string) {
  switch (plan) {
    case "free":
      return "Free";
    case "pro":
      return "Pro";
    default:
      return "Unknown";
  }
}

/**
 * Check if the plan is a free plan
 *
 * @param plan the plan code
 *
 * @returns true if the plan is a free plan
 */
export function isFreePlan(plan?: string) {
  return !plan || plan === "free";
}
