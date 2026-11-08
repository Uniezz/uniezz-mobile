import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { StudentRow } from "@/components/meet";
import { useProfileSearch } from "@/hooks/useProfiles";
import {
  Icon,
  UICollapsingHeader,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISearchOverlay,
  UISkeleton,
  UIText,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

export default function StudentsScreen() {
  const { t } = useTranslation();
  // the list filters by `query`, applied only on submit; `search` is the text being typed
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useProfileSearch(query);
  const students = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleBackPress = () => router.back();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  // the field only exists while the keyboard is up; blurring it closes it, the query stays
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleSearchSubmit = () => {
    setQuery(search);
    Keyboard.dismiss();
  };
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  const headerActions = (
    <UIIconButton
      accessibilityRole="button"
      accessibilityLabel={t("topbar.search")}
      onPress={handleSearchPress}
    >
      <Icon name="search" size={18} />
    </UIIconButton>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("app.students")}
        isCompact={isHeaderCompact}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        data={students}
        keyExtractor={(student) => student.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        contentContainerStyle={styles.list(headerHeight)}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={64} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : (
            <UIText color="secondary">{t("students.noResults")}</UIText>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={64} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <StudentRow student={item} />
          </View>
        )}
      />
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={t("students.search")}
        submitLabel={t("topbar.search")}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(8),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(40),
  }),
  cell: {
    paddingBottom: theme.vs(10),
  },
}));
