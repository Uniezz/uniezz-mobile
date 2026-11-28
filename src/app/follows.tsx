import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FollowList } from "@/@types";
import { StudentRow } from "@/components/meet";
import { useFollowers, useFollowing } from "@/hooks";
import {
  UICollapsingHeader,
  UIEmpty,
  UIPage,
  UIQueryError,
  UISkeletonRow,
  UISubTabs,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

const LISTS: FollowList[] = ["followers", "following"];

// followers and following of a student; without an id, of the signed-in student
export default function FollowsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    list?: FollowList;
  }>();
  const [list, setList] = useState<FollowList>(
    params.list === "following" ? "following" : "followers",
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const followers = useFollowers(params.id);
  const following = useFollowing(params.id);
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = list === "followers" ? followers : following;
  const students = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleBackPress = () => router.back();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  const handleHeaderLayout = (event: LayoutChangeEvent) =>
    setHeaderHeight(event.nativeEvent.layout.height);
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleTabPress = (index: number) =>
    setList(index === 0 ? "followers" : "following");

  return (
    <UIPage>
      <UICollapsingHeader
        title={params.name || t(`follows.${list}`)}
        isCompact={isHeaderCompact}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        data={students}
        keyExtractor={(student) => student.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list(headerHeight)}
        onEndReached={handleEndReached}
        ListHeaderComponent={
          <View style={styles.tabs}>
            <UISubTabs
              items={LISTS.map((item) => t(`follows.${item}`))}
              selectedItemIndex={LISTS.indexOf(list)}
              onPress={handleTabPress}
            />
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <UISkeletonRow isGlass count={6} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : (
            <UIEmpty message={t("follows.empty")} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeletonRow isGlass /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <StudentRow student={item} />
          </View>
        )}
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
  tabs: {
    paddingBottom: theme.vs(12),
  },
  cell: {
    paddingBottom: theme.vs(10),
  },
}));
