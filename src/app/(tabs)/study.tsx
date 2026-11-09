import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Material, MaterialTab } from "@/@types/study";
import { AddMaterial, MaterialList } from "@/components/study";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIChip,
  UICollapsingHeader,
  UIFadeScrollView,
  UIGlass,
  UIIconButton,
  UIPage,
  UISearchOverlay,
  UIText,
} from "@/ui";
import { HEADER_COMPACT_OFFSET, MATERIAL_TABS } from "@/utils";

// shortcut: preview materials until the backend has an exams endpoint
const initialMaterials: Material[] = [
  {
    subject: "Mathematical Analysis II",
    university: "Politechnika",
    type: "Exam",
    author: "Marek Zieliński",
    rating: "4.8",
  },
  {
    subject: "Data Structures & Algorithms",
    university: "Politechnika",
    type: "Exam",
    author: "Taras Hnatiuk",
    rating: "4.5",
  },
  {
    subject: "Thermodynamics, 2024 and 2025",
    university: "Politechnika",
    type: "Exam",
    author: "Piotr Lewandowski",
    rating: "4.9",
  },
  {
    subject: "Constitutional Law, final",
    university: "UMCS",
    type: "Exam",
    author: "Kateryna Melnyk",
    rating: "4.6",
  },
];

export default function StudyScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const [materials, setMaterials] = useState(initialMaterials);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // the list filters by `query`, applied only on submit; `search` is the text being typed
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [tab, setTab] = useState<MaterialTab>("papers");
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  // the search field only exists while the keyboard is up; blurring it closes it, the query stays
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleSearchSubmit = () => {
    setQuery(search);
    Keyboard.dismiss();
  };
  const handleAddPress = () => setAdding(!adding);
  const handleProfilePress = () => router.push("/profile");
  const handleMaterialSave = (material: Material) => {
    setMaterials((current) => [material, ...current]);
    setAdding(false);
  };
  const handleDetailBackPress = () => setSelected(null);

  const headerActions = (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("app.searchMaterials")}
        onPress={handleSearchPress}
      >
        <Icon name="search" size={18} />
      </UIIconButton>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("exams.action")}
        onPress={handleAddPress}
      >
        <Icon name={adding ? "x" : "upload"} size={18} />
      </UIIconButton>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("app.profile")}
        onPress={handleProfilePress}
      >
        <UIAvatar imageSrc={profile?.avatarUrl} />
      </Pressable>
    </>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("tabs.exams")}
        isCompact={isHeaderCompact}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      >
        {/* fades at either edge while more chips are hidden there */}
        <UIFadeScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {MATERIAL_TABS.map(([value, label]) => {
            const handleTabPress = () => setTab(value);
            return (
              <UIChip
                key={value}
                label={t(label)}
                selected={tab === value}
                onPress={handleTabPress}
              />
            );
          })}
        </UIFadeScrollView>
      </UICollapsingHeader>
      {selected ? (
        <ScrollView contentContainerStyle={styles.page(headerHeight)}>
          <UIGlass radius={24} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              onPress={handleDetailBackPress}
            >
              <UIText color="link">{t("app.back")}</UIText>
            </Pressable>
            <UIText size="title3" weight="semibold">
              {selected}
            </UIText>
          </UIGlass>
        </ScrollView>
      ) : (
        <MaterialList
          header={adding ? <AddMaterial onSave={handleMaterialSave} /> : null}
          materials={materials}
          query={query}
          tab={tab}
          headerHeight={headerHeight}
          onScroll={handleScroll}
          onOpen={setSelected}
        />
      )}
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={t("app.searchMaterials")}
        submitLabel={t("topbar.search")}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  page: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
    gap: theme.vs(16),
  }),
  tabs: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
  card: {
    padding: theme.s(16),
    gap: theme.vs(8),
  },
}));
