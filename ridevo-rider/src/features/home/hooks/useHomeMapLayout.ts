import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";

import type { LayoutChangeEvent } from "react-native";

import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import type {
  MapController,
  MapPadding,
} from "@/features/map/types/map-bridge.types";

import { HOME_CONFIG } from "../constants/home.constants";

interface UseHomeMapLayoutOptions {
  mapRef: RefObject<MapController | null>;

  isMapReady: boolean;
}

interface ContainerSize {
  width: number;
  height: number;
}

const { sheet, header, map } = HOME_CONFIG;

export function calculateHomeSnapPoints(height: number): number[] {
  if (height <= 0) {
    return [];
  }

  const maximumSheetHeight = Math.max(1, height - sheet.minimumMapHeight);

  const expanded = Math.min(
    Math.round(height * sheet.expandedRatio),
    maximumSheetHeight,
  );

  const collapsed = Math.min(
    Math.round(height * sheet.collapsedRatio),
    Math.max(1, expanded - 2),
  );

  const defaultHeight = Math.min(
    Math.round(height * sheet.defaultRatio),
    expanded - 1,
  );

  const points = [
    collapsed,
    Math.max(collapsed + 1, defaultHeight),
    expanded,
  ].filter((point) => point > 0 && point <= expanded);

  return [...new Set(points)].sort((first, second) => first - second);
}

export function useHomeMapLayout({
  mapRef,
  isMapReady,
}: UseHomeMapLayoutOptions) {
  const [containerSize, setContainerSize] = useState<ContainerSize>({
    width: 0,
    height: 0,
  });

  const [sheetIndex, setSheetIndex] = useState<number>(sheet.initialIndex);

  const animatedSheetPosition = useSharedValue(0);

  const snapPoints = useMemo(
    () => calculateHomeSnapPoints(containerSize.height),
    [containerSize.height],
  );

  const isLayoutReady =
    containerSize.width > 0 &&
    containerSize.height > 0 &&
    snapPoints.length > 0;

  const initialSheetIndex = Math.min(
    sheet.initialIndex,
    Math.max(0, snapPoints.length - 1),
  );

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setContainerSize((current) => {
      if (current.width === width && current.height === height) {
        return current;
      }

      return {
        width,
        height,
      };
    });
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index >= 0) {
      setSheetIndex(index);
    }
  }, []);

  const effectiveSheetIndex = Math.min(
    Math.max(0, sheetIndex),
    Math.max(0, snapPoints.length - 1),
  );

  const settledSheetHeight = snapPoints[effectiveSheetIndex] ?? 0;

  const minimumRecenterTop =
    header.topSpacing + header.estimatedHeight + map.recenterSpacing;

  const recenterSpacing = map.recenterSpacing;

  const recenterButtonSize = map.recenterButtonSize;

  const recenterAnimatedStyle = useAnimatedStyle(() => {
    const availableTop =
      animatedSheetPosition.value - recenterButtonSize - recenterSpacing;

    const isVisible = availableTop >= minimumRecenterTop;

    return {
      opacity: isVisible ? 1 : 0,

      transform: [
        {
          translateY: isVisible ? availableTop : -100,
        },
      ],
    };
  });

  const canShowRecenter =
    containerSize.height -
      settledSheetHeight -
      recenterButtonSize -
      recenterSpacing >=
    minimumRecenterTop;

  const cameraPadding = useMemo<MapPadding | null>(() => {
    if (!isLayoutReady) {
      return null;
    }

    const { width, height } = containerSize;

    const visibleMapHeight = height - settledSheetHeight;

    const top = Math.min(
      map.cameraPadding.top,
      Math.floor(visibleMapHeight * 0.5),
    );

    const bottomSpacing = Math.min(
      map.cameraPadding.bottomSpacing,
      Math.max(0, visibleMapHeight - top - 40),
    );

    return {
      top,

      bottom: settledSheetHeight + bottomSpacing,

      left: Math.min(map.cameraPadding.left, Math.floor(width * 0.2)),

      right: Math.min(map.cameraPadding.right, Math.floor(width * 0.2)),
    };
  }, [containerSize, isLayoutReady, settledSheetHeight]);

  useEffect(() => {
    if (!isMapReady || !cameraPadding || !mapRef.current) {
      return;
    }

    mapRef.current.setCameraPadding(cameraPadding);
  }, [isMapReady, cameraPadding, mapRef]);

  return {
    containerSize,

    isLayoutReady,

    snapPoints,

    initialSheetIndex,

    sheetIndex: effectiveSheetIndex,

    animatedSheetPosition,

    recenterAnimatedStyle,

    canShowRecenter,

    cameraPadding,

    handleContainerLayout,

    handleSheetChange,
  };
}
