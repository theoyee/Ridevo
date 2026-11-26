import type {
  DriverCoordinates,
  DriverService,
  NearbyDriver,
  NearbyDriversRequest,
  NearbyDriversResponse,
} from "../types/driver.types";

import {
  calculateDestination,
  normalizeHeading,
  randomBetween,
} from "../utils/driver.utils";

import { generateNearbyDrivers } from "../mocks/nearby-drivers.mock";

import { distanceInMeters } from "@/features/location/utils/location.utils";

const DEFAULT_DRIVER_COUNT = 10;
const MAX_DRIVER_COUNT = 30;
const MAX_RADIUS_METERS = 10_000;
const MAX_SIMULATION_STEP_SECONDS = 5;

class MockDriverService implements DriverService {
  private drivers: NearbyDriver[] = [];

  private center: DriverCoordinates | null = null;

  private radius = 0;

  private count = 0;

  private lastUpdatedAt = 0;

  private initialize(
    center: DriverCoordinates,
    radius: number,
    count: number,
  ): void {
    this.center = center;
    this.radius = radius;
    this.count = count;

    this.drivers = generateNearbyDrivers({
      center,
      radius,
      count,
    });

    this.lastUpdatedAt = Date.now();
  }

  private shouldReinitialize(
    center: DriverCoordinates,
    radius: number,
    count: number,
  ): boolean {
    if (!this.center) {
      return true;
    }

    if (this.radius !== radius || this.count !== count) {
      return true;
    }

    const distance = distanceInMeters(this.center, center);

    return distance > radius * 0.5;
  }

  private updateDrivers(): void {
    if (!this.center) return;

    const center = this.center;
    const now = Date.now();

    const elapsedSeconds = Math.min(
      Math.max((now - this.lastUpdatedAt) / 1000, 0),
      MAX_SIMULATION_STEP_SECONDS,
    );

    if (elapsedSeconds === 0) return;

    this.drivers = this.drivers.map((driver) => {
      const heading = normalizeHeading(
        driver.heading + randomBetween(-12, 12) * elapsedSeconds,
      );

      const distance = driver.speed * elapsedSeconds;

      const coordinates = calculateDestination(
        driver.coordinates,
        distance,
        heading,
      );

      const distanceFromCenter = distanceInMeters(center, coordinates);

      // Turn the vehicle around when it reaches
      // the simulation boundary.
      if (distanceFromCenter > this.radius) {
        return {
          ...driver,

          heading: normalizeHeading(driver.heading + 180),

          updatedAt: now,
        };
      }

      return {
        ...driver,
        coordinates,
        heading,
        updatedAt: now,
      };
    });

    this.lastUpdatedAt = now;
  }

  async getNearbyDrivers(
    request: NearbyDriversRequest,
  ): Promise<NearbyDriversResponse> {
    const {
      latitude,
      longitude,
      radius,
      limit = DEFAULT_DRIVER_COUNT,
    } = request;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      throw new Error("Invalid driver search coordinates.");
    }

    if (!Number.isFinite(radius) || radius <= 0 || radius > MAX_RADIUS_METERS) {
      throw new Error("Invalid driver search radius.");
    }

    if (!Number.isFinite(limit) || limit < 1) {
      throw new Error("Invalid driver search limit.");
    }

    const count = Math.min(Math.floor(limit), MAX_DRIVER_COUNT);

    const center = {
      latitude,
      longitude,
    };

    if (this.shouldReinitialize(center, radius, count)) {
      this.initialize(center, radius, count);
    } else {
      this.updateDrivers();
    }

    const drivers = this.drivers
      .filter((driver) => {
        return (
          driver.availability === "available" &&
          distanceInMeters(center, driver.coordinates) <= radius
        );
      })
      .map((driver) => ({
        ...driver,
        coordinates: {
          ...driver.coordinates,
        },
      }));

    return {
      drivers,
      timestamp: Date.now(),
    };
  }

  reset(): void {
    this.drivers = [];
    this.center = null;
    this.radius = 0;
    this.count = 0;
    this.lastUpdatedAt = 0;
  }
}

export const mockDriverService = new MockDriverService();
