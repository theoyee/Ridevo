export const VEHICLE_MARKER_SVG = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="28"
  height="44"
  viewBox="0 0 28 44"
  fill="none"
>
  <!-- Wheels -->
  <g fill="#101820">
    <rect x="2" y="9" width="4" height="8" rx="1.5"/>
    <rect x="22" y="9" width="4" height="8" rx="1.5"/>
    <rect x="2" y="28" width="4" height="8" rx="1.5"/>
    <rect x="22" y="28" width="4" height="8" rx="1.5"/>
  </g>

  <!-- Vehicle body -->
  <rect
    x="4"
    y="2"
    width="20"
    height="40"
    rx="8"
    fill="#FFFFFF"
    stroke="#98A2B3"
    stroke-width="0.8"
  />

  <!-- Bonnet -->
  <path
    d="M8 7Q14 4 20 7L21 11H7L8 7Z"
    fill="#F4F5F7"
  />

  <!-- Front windshield -->
  <path
    d="M8 12H20L22 19H6L8 12Z"
    fill="#344054"
  />

  <!-- Side windows -->
  <rect
    x="6"
    y="20"
    width="2.5"
    height="10"
    rx="1"
    fill="#475467"
  />

  <rect
    x="19.5"
    y="20"
    width="2.5"
    height="10"
    rx="1"
    fill="#475467"
  />

  <!-- Roof -->
  <rect
    x="9"
    y="20"
    width="10"
    height="10"
    rx="2"
    fill="#F4F5F7"
  />

  <!-- Rear windshield -->
  <path
    d="M7 32H21L19 36H9L7 32Z"
    fill="#475467"
  />

  <!-- Headlights -->
  <rect
    x="7"
    y="4.5"
    width="4"
    height="2.5"
    rx="1"
    fill="#D0D5DD"
  />

  <rect
    x="17"
    y="4.5"
    width="4"
    height="2.5"
    rx="1"
    fill="#D0D5DD"
  />

  <!-- Rear lights -->
  <rect
    x="7"
    y="38"
    width="4"
    height="2"
    rx="0.8"
    fill="#DC2626"
  />

  <rect
    x="17"
    y="38"
    width="4"
    height="2"
    rx="0.8"
    fill="#DC2626"
  />
</svg>
`;
