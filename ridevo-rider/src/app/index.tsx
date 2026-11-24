// import { Pressable, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function HomeScreen() {
//   return (
//     <SafeAreaView className="flex-1 bg-background">
//       <View className="flex-1 justify-center px-6">
//         <Text className="text-4xl font-bold text-primary">ridevo.</Text>

//         <Text className="mt-4 text-2xl font-semibold text-primary">
//           Your city. Your ride.
//         </Text>

//         <Text className="mt-2 text-base text-muted">
//           Get wherever life takes you.
//         </Text>

//         <Pressable className="mt-8 h-14 items-center justify-center rounded-button bg-primary active:opacity-80">
//           <Text className="text-base font-semibold text-white">
//             Get started
//           </Text>
//         </Pressable>
//       </View>
//     </SafeAreaView>
//   );
// }

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
