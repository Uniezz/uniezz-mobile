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
  const searchPlaceholder =
    [
      t("app.searchCourses"),
      t("app.searchProfessors"),
      t("app.searchMyMaterials"),
    ][tabIndex] ?? t("app.searchMyMaterials");
  // the header floats over the pages; they start below it and turn it compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const createCourseRef = useRef<BottomSheetModal>(null);
  const scrollOffsets = useRef<number[]>([0, 0, 0]);

  const handlePageScroll =
    (index: number) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      scrollOffsets.current[index] = offset;
      if (index === tabIndex) {
        setIsHeaderCompact(offset > HEADER_COMPACT_OFFSET);
      }
    };
  const handleCoursesScroll = handlePageScroll(0);
  const handleProfessorsScroll = handlePageScroll(1);
  const handleFilesScroll = handlePageScroll(2);
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const index = event.nativeEvent.position;
    setTabIndex(index);
    setIsHeaderCompact(
      (scrollOffsets.current[index] ?? 0) > HEADER_COMPACT_OFFSET,
    );
  };
  // the search field only exists while the keyboard is up; blurring it closes it, the query stays
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleSearchSubmit = () => {
    if (tabIndex !== 1) setQuery(search.trim());
    Keyboard.dismiss();
  };
  const handleAddPress = () => createCourseRef.current?.present();
  const handleProfilePress = () => router.push("/profile");

  const headerActions = (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={searchPlaceholder}
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
          <CoursesPage
            query={query}
            headerHeight={headerHeight}
            onScroll={handleCoursesScroll}
          />
        </View>
        <View key="professors" style={styles.pager}>
          <ProfessorsPage
            headerHeight={headerHeight}
            onScroll={handleProfessorsScroll}
          />
        </View>
        <View key="mine" style={styles.pager}>
          <FilesPage
            query={query}
            headerHeight={headerHeight}
            onScroll={handleFilesScroll}
          />
        </View>
      </PagerView>
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={searchPlaceholder}
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
