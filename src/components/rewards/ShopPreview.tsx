import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UICoin, UIGlass, UIText } from "@/ui";

// placeholder cards only: there is nothing to spend coins on yet
const PREVIEW_CARDS = [0, 1, 2, 3, 4, 5, 6, 7];

// the spend tab until the backend has a shop: a blurred mock of the item grid with a "coming soon" note
export const ShopPreview = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View
        style={styles.grid}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {/* a wide featured offer above the grid */}
        <UIGlass radius={16} style={styles.featured}>
          <View style={styles.featuredPicture} />
          <View style={styles.featuredText}>
            <View style={styles.line} />
            <View style={styles.shortLine} />
            <View style={styles.price}>
              <UICoin size="xs" />
              <View style={styles.shortLine} />
            </View>
          </View>
        </UIGlass>
        {PREVIEW_CARDS.map((card) => (
          <UIGlass key={card} radius={16} style={styles.card}>
            <View style={styles.picture} />
            <View style={styles.line} />
            <View style={styles.price}>
              <UICoin size="xs" />
              <View style={styles.shortLine} />
            </View>
          </UIGlass>
        ))}
      </View>
      <BlurView intensity={30} tint="dark" style={styles.blur} />
      <View style={styles.note}>
        <UIText size="lg" weight="semibold">
          {t("rewards.shopSoonTitle")}
        </UIText>
        <UIText color="secondary" style={styles.noteText}>
          {t("rewards.shopSoonDescription")}
        </UIText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: "hidden",
    borderRadius: theme.vs(16),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.s(12),
  },
  featured: {
    width: "100%",
    flexDirection: "row",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  featuredPicture: {
    width: theme.vs(96),
    height: theme.vs(96),
    borderRadius: theme.vs(12),
    backgroundColor: theme.colors.amber10,
  },
  featuredText: {
    flex: 1,
    justifyContent: "center",
    gap: theme.vs(10),
  },
  card: {
    width: "47%",
    flexGrow: 1,
    gap: theme.vs(10),
    padding: theme.s(12),
  },
  picture: {
    height: theme.vs(96),
    borderRadius: theme.vs(12),
    backgroundColor: theme.colors.white10,
  },
  line: {
    height: theme.vs(12),
    width: "80%",
    borderRadius: theme.vs(6),
    backgroundColor: theme.colors.white10,
  },
  price: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  shortLine: {
    height: theme.vs(10),
    width: "30%",
    borderRadius: theme.vs(5),
    backgroundColor: theme.colors.white10,
  },
  blur: StyleSheet.absoluteFillObject,
  note: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.vs(6),
    paddingHorizontal: theme.s(24),
  },
  noteText: { textAlign: "center" },
}));
