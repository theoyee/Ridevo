import {
  calculateHeading,
  distanceBetween,
  getRoutePosition,
  prepareRoute,
} from "./route-geometry.utils";

describe("route geometry", () => {
  it("returns zero distance for identical points", () => {
    expect(distanceBetween([3.4, 6.5], [3.4, 6.5])).toBe(0);
  });

  it("calculates a northbound heading", () => {
    expect(calculateHeading([3.4, 6.5], [3.4, 6.6])).toBeCloseTo(0);
  });

  it("calculates a southbound heading", () => {
    expect(calculateHeading([3.4, 6.6], [3.4, 6.5])).toBeCloseTo(180);
  });

  it("returns the first coordinate at zero progress", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.6],
    ]);

    expect(getRoutePosition(route, 0).coordinates).toEqual([3.4, 6.5]);
  });

  it("returns the destination at full progress", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.6],
    ]);

    const result = getRoutePosition(route, 1);

    expect(result.coordinates[0]).toBeCloseTo(3.4);

    expect(result.coordinates[1]).toBeCloseTo(6.6);

    expect(result.remainingMeters).toBeCloseTo(0);
  });

  it("interpolates by distance instead of index", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.51],
      [3.4, 6.6],
    ]);

    const result = getRoutePosition(route, 0.5);

    expect(result.coordinates[1]).toBeCloseTo(6.55, 5);
  });

  it("removes consecutive duplicate coordinates", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.5],
      [3.4, 6.6],
    ]);

    expect(route.coordinates).toHaveLength(2);
  });

  it("clamps progress above one", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.6],
    ]);

    expect(getRoutePosition(route, 2).remainingMeters).toBeCloseTo(0);
  });

  it("rejects invalid progress", () => {
    const route = prepareRoute([
      [3.4, 6.5],
      [3.4, 6.6],
    ]);

    expect(() => getRoutePosition(route, NaN)).toThrow();
  });

  it("rejects routes without distinct points", () => {
    expect(() =>
      prepareRoute([
        [3.4, 6.5],
        [3.4, 6.5],
      ]),
    ).toThrow();
  });
});
