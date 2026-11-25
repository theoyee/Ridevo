export type NotificationPermissionStatus =
  "undetermined" | "granted" | "denied" | "blocked";

export interface NotificationPermission {
  status: NotificationPermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

export type NotificationChannel =
  "ride-updates" | "payments" | "account" | "promotions";

export type NotificationEvent =
  | "ride.accepted"
  | "driver.arrived"
  | "ride.started"
  | "ride.completed"
  | "ride.cancelled"
  | "payment.completed"
  | "account.updated"
  | "promotion.available";

export interface RidevoNotification {
  id: string;
  type: NotificationEvent;
  title: string;
  body: string;
  rideId?: string;
  createdAt: string;
  read: boolean;
}

export interface PushRegistration {
  token: string;
  platform: "android" | "ios";
  provider: "expo";
}
