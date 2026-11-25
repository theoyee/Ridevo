// import { View } from "react-native";

// import { Screen } from "@/components/layout/Screen";
// import { Typography } from "@/components/ui/Typography";

// export default function LocationPermissionRoute() {
//   return (
//     <Screen>
//       <View className="flex-1 px-6 pt-10">
//         <Typography variant="h1">Enable location</Typography>

//         <Typography variant="body" className="mt-3 text-muted">
//           Find nearby rides and accurate pickup points.
//         </Typography>
//       </View>
//     </Screen>
//   );
// }

import { LocationPermissionScreen } from "@/features/auth/screens/LocationPermissionScreen";

export default function LocationPermissionRoute() {
  return <LocationPermissionScreen />;
}
