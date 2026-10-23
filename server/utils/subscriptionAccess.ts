import { SubscriptionStatus } from "@prisma/client";

/** A paid entitlement is valid only while its recorded access period is current. */
export const hasUnexpiredSubscription = (
  status: SubscriptionStatus,
  currentPeriodEnd: Date | null,
  now: Date = new Date(),
): boolean => status === SubscriptionStatus.ACTIVE && currentPeriodEnd !== null && currentPeriodEnd > now;
