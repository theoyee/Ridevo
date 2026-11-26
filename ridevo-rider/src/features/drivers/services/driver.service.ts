import type { DriverService } from "../types/driver.types";

import { mockDriverService } from "./driver.mock";

export const driverService: DriverService = {
  async getNearbyDrivers(request) {
    if (!__DEV__) {
      throw new Error("Production driver service has not been configured.");
    }

    return mockDriverService.getNearbyDrivers(request);
  },
};
