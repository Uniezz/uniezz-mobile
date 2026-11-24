import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UISkeleton } from "@/ui";

// a placeholder profile hero: the big avatar over the name and a detail line
export const ProfileHeroSkeleton = () => (
  <View style={styles.hero}>
    <UISkeleton width={112} height={112} borderRadius={56} />
    <UISkeleton width="55%" height={22} borderRadius={8} />
    <UISkeleton width="35%" height={12} borderRadius={6} />
  </View>
);

const styles = StyleSheet.create((theme) => ({
  hero: {
    alignItems: "center",
    gap: theme.vs(14),
    paddingVertical: theme.vs(24),
  },
}));
