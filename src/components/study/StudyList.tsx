import { FlashList } from "@shopify/flash-list";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIEmpty, UIQueryError, UISkeleton } from "@/ui";

type StudyListProps<T extends { id: string }> = {
  items: T[];
  renderItem: (item: T) => ReactElement;
  isPending: boolean;
  isError: boolean;
  isRefetching: boolean;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  /** the floating screen header's height, so the list starts below it */
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

// one paged Study list: files, courses or professors
export function StudyList<T extends { id: string }>({
  items,
  renderItem,
  isPending,
  isError,
  isRefetching,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  headerHeight,
  onScroll,
}: StudyListProps<T>) {
  const { t } = useTranslation();

  return (
    <>
      <FlashList
        style={styles.list}
        data={items}
        maintainVisibleContentPosition={{ disabled: true }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        contentContainerStyle={styles.listContent(headerHeight)}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        onEndReached={onEndReached}
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={64} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={onRefresh} />
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={64} /> : null
        }
      />
      {/* beside the list, not inside it: centred on the screen like the other tabs' cat, not under the chips */}
      {!isPending && !isError && items.length === 0 ? (
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
}));
