import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { StyleSheet } from "react-native-unistyles";
import {
  CoursesPage,
  CreateCourseSheet,
  FilesPage,
  ProfessorsPage,
} from "@/components/study";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIChip,
  UICollapsingHeader,
  UIFadeScrollView,
  UIIconButton,
  UIPage,
  UISearchOverlay,
} from "@/ui";
import { HEADER_COMPACT_OFFSET, MATERIAL_TABS } from "@/utils";

export default function StudyScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  // `search` is the text being typed; `query` is applied on submit and searches past papers
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // the selected page; the chips and a swipe both change it
  const [tabIndex, setTabIndex] = useState(0);
  // the header floats over the pages; they start below it and turn it compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const createCourseRef = useRef<BottomSheetModal>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    setTabIndex(event.nativeEvent.position);
    setIsHeaderCompact(false);
  };
  // the search field only exists while the keyboard is up; blurring it closes it, the query stays
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleSearchSubmit = () => {
    setQuery(search.trim());
    pagerRef.current?.setPage(0);
    Keyboard.dismiss();
  };
  const handleAddPress = () => createCourseRef.current?.present();
  const handleProfilePress = () => router.push("/profile");

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
        accessibilityLabel={t("study.addCourse")}
        disabled={!profile}
        onPress={handleAddPress}
      >
        <Icon name="plus" size={18} />
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
          {MATERIAL_TABS.map(([value, label], index) => {
            const handleTabPress = () => pagerRef.current?.setPage(index);
            return (
              <UIChip
                key={value}
                label={t(label)}
                selected={tabIndex === index}
                onPress={handleTabPress}
              />
            );
          })}
        </UIFadeScrollView>
      </UICollapsingHeader>
      {/* page order follows MATERIAL_TABS */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="reviews" style={styles.pager}>
          <CoursesPage headerHeight={headerHeight} onScroll={handleScroll} />
        </View>
        <View key="professors" style={styles.pager}>
          <ProfessorsPage headerHeight={headerHeight} onScroll={handleScroll} />
        </View>
        <View key="mine" style={styles.pager}>
          <FilesPage
            query={query}
            headerHeight={headerHeight}
            onScroll={handleScroll}
          />
        </View>
      </PagerView>
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={t("app.searchMaterials")}
        submitLabel={t("topbar.search")}
      />
      {profile ? (
        <CreateCourseSheet
          ref={createCourseRef}
          universityId={profile.universityId}
        />
      ) : null}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabs: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
  pager: { flex: 1 },
}));
