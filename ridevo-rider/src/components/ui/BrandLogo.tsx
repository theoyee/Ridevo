import { Image } from "expo-image";

interface BrandLogoProps {
  width?: number;
  height?: number;
}

const LOGO = require("../../../assets/images/logo.png");

export function BrandLogo({ width = 112, height = 36 }: BrandLogoProps) {
  return (
    <Image
      source={LOGO}
      style={{ width, height }}
      contentFit="contain"
      contentPosition="left center"
      accessibilityLabel="Ridevo"
      accessible
    />
  );
}
