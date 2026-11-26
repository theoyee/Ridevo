export const HOME_CONFIG = {
  sheet: {
    collapsedRatio: 0.28,
    defaultRatio: 0.42,
    expandedRatio: 0.75,

    initialIndex: 1,

    borderRadius: 28,

    minimumMapHeight: 180,
  },

  header: {
    horizontalSpacing: 16,
    topSpacing: 16,

    logoWidth: 105,
    logoHeight: 32,

    estimatedHeight: 74,
  },

  map: {
    recenterSpacing: 16,
    recenterButtonSize: 48,

    cameraPadding: {
      top: 104,
      left: 24,
      right: 24,
      bottomSpacing: 24,
    },
  },
} as const;
