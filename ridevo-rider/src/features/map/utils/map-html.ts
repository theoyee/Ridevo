import {
  DEFAULT_CAMERA,
  MAP_CONFIG,
  MAP_STYLES,
} from "../constants/map.constants";

import { VEHICLE_MARKER_SVG } from "./vehicle-marker";

import {
  INTERPOLATION_SCRIPT,
  VEHICLE_ANIMATION_CONFIG,
} from "./interpolation.utils";

interface CreateMapHtmlOptions {
  accessToken: string;
  styleURL?: string;
}

export function createMapHtml({
  accessToken,
  styleURL = MAP_STYLES.light,
}: CreateMapHtmlOptions): string {
  const config = JSON.stringify({
    accessToken,
    styleURL,
    camera: DEFAULT_CAMERA,
    minZoom: MAP_CONFIG.minZoomLevel,
    maxZoom: MAP_CONFIG.maxZoomLevel,
    animation: VEHICLE_ANIMATION_CONFIG,
  }).replace(/</g, "\\u003c");

  const vehicleMarkerSvg = JSON.stringify(VEHICLE_MARKER_SVG).replace(
    /</g,
    "\\u003c",
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0,
    maximum-scale=1.0, user-scalable=no"
  />

  <link
    href="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css"
    rel="stylesheet"
  />

  <script
    src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"
  ></script>

  <style>
    * {
      box-sizing: border-box;
    }

    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #F3F5F0;
    }

    .user-location {
      width: 20px;
      height: 20px;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
      pointer-events: none;
      z-index: 2;
    }

    .vehicle-marker {
      width: 22px;
      height: 35px;
      pointer-events: none;
      user-select: none;
      z-index: 1;
      filter: drop-shadow(
        0 2px 2px rgba(16, 24, 32, 0.22)
      );
    }

    .vehicle-marker svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script>
    const config = ${config};
    const vehicleMarkerSvg = ${vehicleMarkerSvg};

    // --------------------------------------------------
    // Constants
    // --------------------------------------------------

    const ACCURACY_SOURCE = "user-location-accuracy";
    const ACCURACY_FILL = "user-location-accuracy-fill";
    const ACCURACY_OUTLINE = "user-location-accuracy-outline";

    const EARTH_RADIUS = 6371008.8;
    const CIRCLE_STEPS = 64;

    const ANIMATION_DURATION =
      config.animation.durationMs;

    const MAX_VISIBLE_VEHICLES =
      config.animation.maxVisibleVehicles;

    const POSITION_EPSILON =
      config.animation.positionEpsilon;

    const HEADING_EPSILON =
      config.animation.headingEpsilon;

    // --------------------------------------------------
    // Map state
    // --------------------------------------------------

    let map = null;
    let userMarker = null;
    let isReady = false;

    let animationFrameId = null;

    let performanceFrameCount = 0;

    let performanceWindowStart = null;

    const ENABLE_PERFORMANCE_LOGGING = ${__DEV__};

    const vehicleMarkers = new Map();

    // --------------------------------------------------
    // Interpolation utilities
    // --------------------------------------------------

    ${INTERPOLATION_SCRIPT}

    const ROUTE_SOURCE_ID = "ridevo-route-source";
    const ROUTE_LAYER_ID = "ridevo-route-layer";
    const ROUTE_OUTLINE_ID = "ridevo-route-outline";

    function setRoute(options) {
      if (!map || !isReady || !options) {
        return;
      }

      const coordinates = options.coordinates;

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !coordinates.every(isValidCoordinates)
      ) {
        return;
      }

      const data = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      };

      const source = map.getSource(ROUTE_SOURCE_ID);

      if (source) {
        source.setData(data);
      } else {
        map.addSource(ROUTE_SOURCE_ID, {
          type: "geojson",
          data: data,
        });
      }

      const color = options.color || "#101820";

      const width = Math.min(
        12,
        Math.max(2, Number(options.width) || 5)
      );

      if (!map.getLayer(ROUTE_OUTLINE_ID)) {
        map.addLayer({
          id: ROUTE_OUTLINE_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,

          layout: {
            "line-cap": "round",
            "line-join": "round",
          },

          paint: {
            "line-color": "#FFFFFF",
            "line-width": width + 3,
          },
        });
      }

      if (!map.getLayer(ROUTE_LAYER_ID)) {
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,

          layout: {
            "line-cap": "round",
            "line-join": "round",
          },

          paint: {
            "line-color": color,
            "line-width": width,
          },
        });
      } else {
        map.setPaintProperty(
          ROUTE_LAYER_ID,
          "line-color",
          color
        );

        map.setPaintProperty(
          ROUTE_LAYER_ID,
          "line-width",
          width
        );

        map.setPaintProperty(
          ROUTE_OUTLINE_ID,
          "line-width",
          width + 3
        );
      }
    }

    function clearRoute() {
      if (!map || !isReady) {
        return;
      }

      if (map.getLayer(ROUTE_LAYER_ID)) {
        map.removeLayer(ROUTE_LAYER_ID);
      }

      if (map.getLayer(ROUTE_OUTLINE_ID)) {
        map.removeLayer(ROUTE_OUTLINE_ID);
      }

      if (map.getSource(ROUTE_SOURCE_ID)) {
        map.removeSource(ROUTE_SOURCE_ID);
      }
    }

    function fitCoordinates(options) {
      if (!map || !isReady || !options) {
        return;
      }

      const coordinates = options.coordinates;

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !coordinates.every(isValidCoordinates)
      ) {
        return;
      }

      const bounds = new mapboxgl.LngLatBounds();

      coordinates.forEach(function (coordinate) {
        bounds.extend(coordinate);
      });

      map.fitBounds(bounds, {
        padding: options.padding || {
          top: 60,
          right: 40,
          bottom: 60,
          left: 40,
        },

        retainPadding: false,

        duration: options.duration ?? 800,

        maxZoom: options.maxZoom ?? 16,
      });
    }

    function getCamera() {
      if (!map || !isReady) {
        return;
      }

      const center = map.getCenter();

      emit("CAMERA_CHANGED", {
        coordinates: [center.wrap().lng, center.lat],
        zoomLevel: map.getZoom(),
        heading: map.getBearing(),
        pitch: map.getPitch(),
      });
    }

    // --------------------------------------------------
    // React Native communication
    // --------------------------------------------------

    function emit(type, payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type, payload })
        );
      }
    }

    // --------------------------------------------------
    // Coordinate validation
    // --------------------------------------------------

    function isValidCoordinates(coordinates) {
      return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        Number.isFinite(coordinates[0]) &&
        Number.isFinite(coordinates[1]) &&
        Math.abs(coordinates[0]) <= 180 &&
        Math.abs(coordinates[1]) <= 90
      );
    }

    // --------------------------------------------------
    // Empty GeoJSON collection
    // --------------------------------------------------

    function createEmptyFeatureCollection() {
      return {
        type: "FeatureCollection",
        features: []
      };
    }

    // --------------------------------------------------
    // Geographical accuracy circle
    // --------------------------------------------------

    function createAccuracyCircle(coordinates, radius) {
      const longitude =
        coordinates[0] * Math.PI / 180;

      const latitude =
        coordinates[1] * Math.PI / 180;

      const angularDistance =
        radius / EARTH_RADIUS;

      const points = [];

      for (let i = 0; i < CIRCLE_STEPS; i++) {
        const bearing =
          (i / CIRCLE_STEPS) * Math.PI * 2;

        const lat = Math.asin(
          Math.sin(latitude) *
            Math.cos(angularDistance) +
          Math.cos(latitude) *
            Math.sin(angularDistance) *
            Math.cos(bearing)
        );

        const lng = longitude + Math.atan2(
          Math.sin(bearing) *
            Math.sin(angularDistance) *
            Math.cos(latitude),
          Math.cos(angularDistance) -
            Math.sin(latitude) * Math.sin(lat)
        );

        points.push([
          lng * 180 / Math.PI,
          lat * 180 / Math.PI
        ]);
      }

      points.push([...points[0]]);

      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [points]
        }
      };
    }

    // --------------------------------------------------
    // Accuracy source and layers
    // --------------------------------------------------

    function initializeAccuracyLayers() {
      if (!map) return;

      if (!map.getSource(ACCURACY_SOURCE)) {
        map.addSource(ACCURACY_SOURCE, {
          type: "geojson",
          data: createEmptyFeatureCollection()
        });
      }

      if (!map.getLayer(ACCURACY_FILL)) {
        map.addLayer({
          id: ACCURACY_FILL,
          type: "fill",
          source: ACCURACY_SOURCE,
          paint: {
            "fill-color": "#2563EB",
            "fill-opacity": 0.12
          }
        });
      }

      if (!map.getLayer(ACCURACY_OUTLINE)) {
        map.addLayer({
          id: ACCURACY_OUTLINE,
          type: "line",
          source: ACCURACY_SOURCE,
          paint: {
            "line-color": "#2563EB",
            "line-opacity": 0.35,
            "line-width": 1
          }
        });
      }
    }

    function updateAccuracyCircle(coordinates, accuracy) {
      if (!map) return;

      const source = map.getSource(ACCURACY_SOURCE);

      if (!source) return;

      if (
        !isValidCoordinates(coordinates) ||
        !Number.isFinite(accuracy) ||
        accuracy <= 0
      ) {
        source.setData(
          createEmptyFeatureCollection()
        );

        return;
      }

      source.setData(
        createAccuracyCircle(coordinates, accuracy)
      );
    }

    function clearAccuracyCircle() {
      if (!map) return;

      const source = map.getSource(ACCURACY_SOURCE);

      if (source) {
        source.setData(
          createEmptyFeatureCollection()
        );
      }
    }

    // --------------------------------------------------
    // User location marker
    // --------------------------------------------------

    function setUserLocation(coordinates, accuracy) {
      if (!map || !isReady) return;

      if (!isValidCoordinates(coordinates)) return;

      if (!userMarker) {
        const element = document.createElement("div");

        element.className = "user-location";

        userMarker = new mapboxgl.Marker({
          element,
          anchor: "center"
        })
          .setLngLat(coordinates)
          .addTo(map);
      } else {
        userMarker.setLngLat(coordinates);
      }

      updateAccuracyCircle(coordinates, accuracy);
    }

    function clearUserLocation() {
      if (userMarker) {
        userMarker.remove();
        userMarker = null;
      }

      clearAccuracyCircle();
    }

    // --------------------------------------------------
    // Vehicle validation
    // --------------------------------------------------

    function isValidVehicle(vehicle) {
      return (
        vehicle &&
        typeof vehicle.id === "string" &&
        vehicle.id.trim().length > 0 &&
        isValidCoordinates(vehicle.coordinates) &&
        Number.isFinite(vehicle.heading)
      );
    }

    // --------------------------------------------------
    // Create vehicle marker and animation state
    // --------------------------------------------------

    function createVehicleMarker(vehicle) {
      const element = document.createElement("div");

      element.className = "vehicle-marker";

      element.setAttribute("aria-hidden", "true");

      element.innerHTML = vehicleMarkerSvg;

      const coordinates = [...vehicle.coordinates];

      const heading = normalizeVehicleHeading(
        vehicle.heading
      );

      const marker = new mapboxgl.Marker({
        element,
        anchor: "center",
        rotationAlignment: "map",
        pitchAlignment: "map"
      })
        .setLngLat(coordinates)
        .setRotation(heading)
        .addTo(map);

      const state = {
        marker,

        currentCoordinates: [...coordinates],
        currentHeading: heading,

        startCoordinates: [...coordinates],
        startHeading: heading,

        targetCoordinates: [...coordinates],
        targetHeading: heading,

        startedAt: 0,
        duration: ANIMATION_DURATION,

        isAnimating: false
      };

      vehicleMarkers.set(vehicle.id, state);

      return state;
    }

    // --------------------------------------------------
    // Render vehicle state
    // --------------------------------------------------

    function renderVehicle(state) {
      state.marker.setLngLat(
        state.currentCoordinates
      );

      state.marker.setRotation(
        state.currentHeading
      );
    }

    // --------------------------------------------------
    // Advance individual vehicle animation
    // --------------------------------------------------

    function advanceVehicleAnimation(state, timestamp) {
      if (!state.isAnimating) {
        return false;
      }

      const elapsed = timestamp - state.startedAt;

      const progress = clamp(
        elapsed / state.duration,
        0,
        1
      );

      state.currentCoordinates =
        interpolateCoordinates(
          state.startCoordinates,
          state.targetCoordinates,
          progress
        );

      state.currentHeading =
        interpolateHeading(
          state.startHeading,
          state.targetHeading,
          progress
        );

      if (progress >= 1) {
        state.currentCoordinates = [
          ...state.targetCoordinates
        ];

        state.currentHeading =
          state.targetHeading;

        state.isAnimating = false;
      }

      renderVehicle(state);

      return state.isAnimating;
    }

    // --------------------------------------------------
    // Shared animation loop
    // --------------------------------------------------


    function measureAnimationPerformance(timestamp) {
      if (!ENABLE_PERFORMANCE_LOGGING) {
        return;
      }

      if (performanceWindowStart === null) {
        performanceWindowStart = timestamp;
        performanceFrameCount = 0;
        return;
      }

      performanceFrameCount++;

      const elapsed =
        timestamp - performanceWindowStart;

      if (elapsed < 1000) {
        return;
      }

      const fps = Math.round(
        performanceFrameCount * 1000 / elapsed
      );

      emit("MAP_PERFORMANCE", {
        fps,
        vehicleCount: vehicleMarkers.size
      });

      performanceFrameCount = 0;
      performanceWindowStart = timestamp;
    }

    function animateVehicles(timestamp) {
      animationFrameId = null;

      if (!map || !isReady || document.hidden) {
        resetPerformanceMeasurement();
        return;
      }

      measureAnimationPerformance(timestamp);

      let hasActiveAnimations = false;

      for (const state of vehicleMarkers.values()) {
        if (!state.isAnimating) {
          continue;
        }

        const stillAnimating =
          advanceVehicleAnimation(
            state,
            timestamp
          );

        if (stillAnimating) {
          hasActiveAnimations = true;
        }
      }

      if (hasActiveAnimations) {
        animationFrameId =
          requestAnimationFrame(animateVehicles);
      } else {
        resetPerformanceMeasurement();
      }
    }

    // --------------------------------------------------
    // Start shared animation loop
    // --------------------------------------------------
    function resetPerformanceMeasurement() {
      performanceFrameCount = 0;
      performanceWindowStart = null;
    }

    function startAnimationLoop() {
      if (!map || !isReady || document.hidden) {
        return;
      }

      if (animationFrameId !== null) {
        return;
      }

      animationFrameId =
        requestAnimationFrame(animateVehicles);
    }

    // --------------------------------------------------
    // Stop shared animation loop
    // --------------------------------------------------

    function stopAnimationLoop() {
      resetPerformanceMeasurement();

      if (animationFrameId === null) {
        return;
      }

      cancelAnimationFrame(animationFrameId);

      animationFrameId = null;
    }

    // --------------------------------------------------
    // Check whether animations remain active
    // --------------------------------------------------

    function hasActiveVehicleAnimations() {
      for (const state of vehicleMarkers.values()) {
        if (state.isAnimating) {
          return true;
        }
      }

      return false;
    }

    // --------------------------------------------------
    // Update vehicle animation target
    // --------------------------------------------------

    function updateVehicleMarker(state, vehicle, now) {
      const nextCoordinates = [...vehicle.coordinates];

      const nextHeading = normalizeVehicleHeading(
        vehicle.heading
      );

      const samePosition = coordinatesAreEqual(
        state.targetCoordinates,
        nextCoordinates,
        POSITION_EPSILON
      );

      const sameHeading = headingsAreEqual(
        state.targetHeading,
        nextHeading,
        HEADING_EPSILON
      );

      // Ignore unchanged snapshots.
      if (samePosition && sameHeading) {
        return;
      }

      // Resolve the current animation before replacing
      // its destination.
      if (state.isAnimating) {
        advanceVehicleAnimation(state, now);
      }

      // Start from the current interpolated position.
      state.startCoordinates = [
        ...state.currentCoordinates
      ];

      state.startHeading =
        state.currentHeading;

      state.targetCoordinates =
        nextCoordinates;

      state.targetHeading =
        nextHeading;

      state.startedAt = now;

      state.duration = ANIMATION_DURATION;

      state.isAnimating = true;
    }

    // --------------------------------------------------
    // Remove individual vehicle
    // --------------------------------------------------

    function removeVehicleMarker(id) {
      const state = vehicleMarkers.get(id);

      if (!state) return;

      state.isAnimating = false;

      state.marker.remove();

      vehicleMarkers.delete(id);
    }

    // --------------------------------------------------
    // Reconcile incoming driver snapshot
    // --------------------------------------------------

    function setNearbyDrivers(drivers) {
      if (!map || !isReady) return;

      if (!Array.isArray(drivers)) return;

      const incomingIds = new Set();

      const now = performance.now();

      let processed = 0;

      for (const vehicle of drivers) {
        if (processed >= MAX_VISIBLE_VEHICLES) {
          break;
        }

        if (!isValidVehicle(vehicle)) {
          continue;
        }

        if (incomingIds.has(vehicle.id)) {
          continue;
        }

        incomingIds.add(vehicle.id);

        processed++;

        const existingState =
          vehicleMarkers.get(vehicle.id);

        if (existingState) {
          updateVehicleMarker(
            existingState,
            vehicle,
            now
          );
        } else {
          createVehicleMarker(vehicle);
        }
      }

      // Remove vehicles absent from the latest snapshot.
      for (const id of vehicleMarkers.keys()) {
        if (!incomingIds.has(id)) {
          removeVehicleMarker(id);
        }
      }

      if (hasActiveVehicleAnimations()) {
        startAnimationLoop();
      } else {
        stopAnimationLoop();
      }
    }

    // --------------------------------------------------
    // Clear all nearby vehicles
    // --------------------------------------------------

    function clearNearbyDrivers() {
      stopAnimationLoop();

      for (const state of vehicleMarkers.values()) {
        state.isAnimating = false;

        state.marker.remove();
      }

      vehicleMarkers.clear();
    }

    // --------------------------------------------------
    // Document visibility lifecycle
    // --------------------------------------------------

    function handleVisibilityChange() {
      if (document.hidden) {
        stopAnimationLoop();

        return;
      }

      if (hasActiveVehicleAnimations()) {
        startAnimationLoop();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // --------------------------------------------------
    // Camera management
    // --------------------------------------------------

    function setCamera(payload) {
      if (!map || !isReady || !payload) return;

      if (
        !isValidCoordinates(payload.centerCoordinate)
      ) {
        return;
      }

      map.easeTo({
        center: payload.centerCoordinate,
        zoom: payload.zoomLevel ?? map.getZoom(),
        bearing: payload.heading ?? map.getBearing(),
        pitch: payload.pitch ?? map.getPitch(),
        duration: payload.duration ?? 800
      });
    }

    // --------------------------------------------------
    // React Native -> WebView communication
    // --------------------------------------------------


    function setCameraPadding(padding) {
      if (!map || !isReady || !padding) {
        return;
      }

      const values = [
        padding.top,
        padding.right,
        padding.bottom,
        padding.left,
      ];

      if (
        !values.every(
          (value) =>
            Number.isFinite(value) &&
            value >= 0
        )
      ) {
        return;
      }

      const container = map.getContainer();

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (
        padding.left + padding.right >= width ||
        padding.top + padding.bottom >= height
      ) {
        return;
      }

      const currentPadding = map.getPadding();

      const isUnchanged =
        Math.abs(
          currentPadding.top - padding.top
        ) < 1 &&
        Math.abs(
          currentPadding.right - padding.right
        ) < 1 &&
        Math.abs(
          currentPadding.bottom - padding.bottom
        ) < 1 &&
        Math.abs(
          currentPadding.left - padding.left
        ) < 1;

      if (isUnchanged) {
        return;
      }

      map.setPadding(padding);
    }

    window.ridevoMap = {
      dispatch(command) {
        if (!map || !isReady || !command) return;

        switch (command.type) {
          case "SET_CAMERA": {
            setCamera(command.payload);

            break;
          }

          case "SET_USER_LOCATION": {
            const payload = command.payload;

            if (!payload) return;

            setUserLocation(
              payload.coordinates,
              payload.accuracy
            );

            break;
          }

          case "CLEAR_USER_LOCATION": {
            clearUserLocation();

            break;
          }

          case "SET_NEARBY_DRIVERS": {
            const payload = command.payload;

            if (!payload) return;

            setNearbyDrivers(payload.drivers);

            break;
          }

          case "CLEAR_NEARBY_DRIVERS": {
            clearNearbyDrivers();

            break;
          }

          case "SET_CAMERA_PADDING": {
            setCameraPadding(command.payload);
            break;
          }

          case "SET_ROUTE": {
            setRoute(command.payload);
            break;
          }

          case "CLEAR_ROUTE": {
            clearRoute();
            break;
          }

          case "FIT_COORDINATES": {
            fitCoordinates(command.payload);
            break;
          }

          case "GET_CAMERA": {
            getCamera();
            break;
          }

          default: {
            break;
          }
        }
      }
    };

    // --------------------------------------------------
    // Map cleanup
    // --------------------------------------------------

    function disposeMap() {
      clearRoute();
      isReady = false;

      stopAnimationLoop();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      clearNearbyDrivers();

      clearUserLocation();

      if (map) {
        map.remove();

        map = null;
      }
    }

    window.addEventListener(
      "pagehide",
      disposeMap,
      { once: true }
    );

    // --------------------------------------------------
    // Initialize Mapbox
    // --------------------------------------------------

    try {
      if (typeof mapboxgl === "undefined") {
        throw new Error(
          "Mapbox library failed to load."
        );
      }

      if (!mapboxgl.supported()) {
        throw new Error(
          "WebGL is not supported."
        );
      }

      mapboxgl.accessToken = config.accessToken;

      map = new mapboxgl.Map({
        container: "map",
        style: config.styleURL,

        center: config.camera.centerCoordinate,
        zoom: config.camera.zoomLevel,
        bearing: config.camera.heading,
        pitch: config.camera.pitch,

        minZoom: config.minZoom,
        maxZoom: config.maxZoom,

        pitchWithRotate: false,
        touchPitch: false,

        attributionControl: true
      });

      // ------------------------------------------------
      // Map ready
      // ------------------------------------------------

      map.on("load", function () {
        try {
          initializeAccuracyLayers();

          isReady = true;

          emit("MAP_READY");
        } catch (error) {
          isReady = false;

          emit("MAP_ERROR", {
            message:
              error.message ||
              "Unable to initialize map layers."
          });
        }
      });

      // ------------------------------------------------
      // Map errors
      // ------------------------------------------------

      map.on("error", function (event) {
        if (!isReady) {
          emit("MAP_ERROR", {
            message:
              event.error?.message ||
              "Unable to load the map."
          });
        }
      });

      // ------------------------------------------------
      // Map interaction
      // ------------------------------------------------

      map.on("click", function (event) {
        emit("MAP_PRESS", {
          coordinates: [
            event.lngLat.lng,
            event.lngLat.lat
          ]
        });
      });

      // ------------------------------------------------
      // Camera movement completed
      // ------------------------------------------------

      map.on("moveend", getCamera);

    } catch (error) {
      isReady = false;

      emit("MAP_ERROR", {
        message:
          error.message ||
          "Map initialization failed."
      });
    }
  </script>
</body>
</html>
`;
}
