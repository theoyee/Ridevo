const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

export const mapService = {
  getAccessToken(): string {
    if (!accessToken) {
      throw new Error("Mapbox access token is missing.");
    }

    if (!accessToken.startsWith("pk.")) {
      throw new Error("A public Mapbox access token is required.");
    }

    return accessToken;
  },
};
