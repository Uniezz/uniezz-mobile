import { FlashList } from "@shopify/flash-list";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Material, MaterialTab } from "@/@types/study";
import { Icon, UIEmpty, UIGlass, UIText } from "@/ui";

const TYPE_ICONS = {
  Exam: "file-check",
  Colloquium: "clipboard-list",
  "Lab reports": "flask-conical",
  Notes: "notebook-pen",
} as const;

export function MaterialList({
  header,
  materials,
  query,
  tab,
  headerHeight,
  onScroll,
  onOpen,
}: {
  header: ReactNode;
  materials: Material[];
  /** the submitted search; filters by subject and university */
  query: string;
  /** only past papers have materials so far */
  tab: MaterialTab;
  /** the floating screen header's height, so the list starts below it */
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onOpen: (subject: string) => void;
}) {
  const { t } = useTranslation();
  const visible =
    tab === "papers"
      ? materials.filter((item) =>
          `${item.subject} ${item.university}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : [];
  return (
    <>
      <FlashList
        style={styles.list}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent(headerHeight)}
        data={visible}
        keyExtractor={(item) => `${item.subject}-${item.author}`}
        ListHeaderComponent={
          header ? <View style={styles.header}>{header}</View> : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.cell}
            accessibilityRole="button"
            onPress={() => onOpen(item.subject)}
          >
            <UIGlass radius={16} style={styles.row}>
              <View style={styles.tile}>
                <Icon
                  name={
                    TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ??
                    "file-check"
                  }
                  size={18}
                  uniProps={(theme) => ({ color: theme.colors.white80 })}
                />
              </View>
              <View style={styles.text}>
                <UIText weight="semibold">{item.subject}</UIText>
                <UIText size="xs" color="secondary">
                  {item.type} · {item.university}
                </UIText>
              </View>
              <View style={styles.rating}>
                <Icon
                  name="star"
                  size={13}
                  uniProps={(theme) => ({ color: theme.colors.amber })}
                />
                <UIText size="body" weight="semibold">
                  {item.rating}
                </UIText>
              </View>
            </UIGlass>
          </Pressable>
        )}
      />
      {/* beside the list, not inside it: centred on the screen like the other tabs' cat, not under the chips */}
      {visible.length === 0 ? (
        <UIEmpty isScreenCentred message={t("app.empty")} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  list: { flex: 1 },
  // UIPage already pads the status bar; the rest of the screen header's height (chips included) is added here
  listContent: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
  header: { paddingBottom: theme.vs(16) },
  // one glass card per material, 8pt apart, as in the design
  cell: {
    paddingBottom: theme.vs(8),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  tile: {
    width: theme.vs(40),
    height: theme.vs(40),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.white5,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: theme.vs(3) },
  rating: {
    width: theme.s(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.s(5),
  },
}));
