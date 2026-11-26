import type { RideStatus } from "../types/ride.types";

const RIDE_TRANSITIONS: Record<RideStatus, readonly RideStatus[]> = {
  searching: ["accepted", "cancelled", "unmatched"],

  accepted: ["arriving", "arrived", "cancelled"],

  arriving: ["arrived", "cancelled"],

  arrived: ["in_progress", "cancelled"],

  in_progress: ["completed"],

  completed: [],

  cancelled: [],

  unmatched: [],
};

export function canTransitionRide(
  current: RideStatus,
  next: RideStatus,
): boolean {
  return RIDE_TRANSITIONS[current].includes(next);
}

export function isTerminalRideStatus(status: RideStatus): boolean {
  return (
    status === "completed" || status === "cancelled" || status === "unmatched"
  );
}

export function isActiveRideStatus(status: RideStatus): boolean {
  return !isTerminalRideStatus(status);
}

export function canCancelRide(status: RideStatus): boolean {
  return canTransitionRide(status, "cancelled");
}

export function assertRideTransition(
  current: RideStatus,
  next: RideStatus,
): void {
  if (!canTransitionRide(current, next)) {
    throw new Error(`Invalid ride transition: ${current} -> ${next}`);
  }
}
