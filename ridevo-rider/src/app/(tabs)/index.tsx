// import { Alert, View } from "react-native";

// import { Screen } from "@/components/layout/Screen";
// import { BrandLogo } from "@/components/ui/BrandLogo";
// import { Typography } from "@/components/ui/Typography";

// import { Button } from "@/components/ui/Button";
// import { notificationService } from "@/features/notifications/services/notification.service";

// export default function HomeScreen() {
//   return (
//     <Screen>
//       <View className="flex-1 px-6 pt-4">
//         <BrandLogo width={100} height={36} />

//         <Typography variant="h1" className="mt-10">
//           Where to?
//         </Typography>

//         <Typography variant="body" className="mt-3 text-muted">
//           Your next journey starts here.
//         </Typography>

//         {__DEV__ ? (
//           <Button
//             title="Test notification"
//             onPress={async () => {
//               try {
//                 const id = await notificationService.sendTestNotification();

//                 console.log("Notification ID:", id);
//               } catch (error) {
//                 console.error("Notification failed:", error);

//                 Alert.alert(
//                   "Notification failed",
//                   error instanceof Error ? error.message : String(error),
//                 );
//               }
//             }}
//           />
//         ) : null}
//       </View>
//     </Screen>
//   );
// }

import { HomeScreen } from "@/features/home/screens/HomeScreen";

export default function HomeRoute() {
  return <HomeScreen />;
}
