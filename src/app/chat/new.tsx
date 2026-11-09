import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { CreateGroupFormValues } from "@/@types/chat";
import { RowPickerItem } from "@/components";
import { useProfileSearch } from "@/hooks/useProfiles";
import { useUniversities } from "@/hooks/useUniversities";
import { createGroupSchema } from "@/schemas";
import { useChatStore } from "@/store/chat";
import {
  Icon,
  UIAvatar,
  UIButton,
  UICollapsingHeader,
  UIEmpty,
  UIIconButton,
  UIInput,
  UIPage,
  UIQueryError,
  UISearchOverlay,
  UISkeleton,
  UIText,
  UIUniversityLogo,
} from "@/ui";
import { authorName, HEADER_COMPACT_OFFSET } from "@/utils";
import { captureAction } from "@/utils/analytics";

export default function NewGroupScreen() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const createGroup = useChatStore((state) => state.createGroup);
  const { data: universities = [] } = useUniversities();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
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
  } = useProfileSearch(query);
  const students = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { groupName: "", members: [] },
    mode: "onChange",
  });
  // the heading count and the rows both follow the picked students
  const members = useWatch({ control, name: "members" });

  const { bottom: bottomInset } = useSafeAreaInsets();
  const handleBackPress = () => router.back();
  // the field only exists while the keyboard is up, as on the feed; blurring it closes it, the results stay
  const [isSearching, setIsSearching] = useState(false);
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleSearchSubmit = () => {
    setQuery(search);
    Keyboard.dismiss();
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleCreatePress = handleSubmit(
    ({ groupName, members: memberIds }) => {
      captureAction(posthog, "group_create", "attempted", { storage: "local" });
      try {
        const id = createGroup(groupName, memberIds);
        captureAction(posthog, "group_create", "succeeded", {
          storage: "local",
        });
        // replaces this form, so back from the new group returns to the chat list
        router.replace({ pathname: "/chat/[id]", params: { id } });
      } catch (error) {
        captureAction(posthog, "group_create", "failed", { storage: "local" });
        throw error;
      }
    },
    () => captureAction(posthog, "group_form", "validation_failed"),
  );

  const listHeader = (
    <View style={styles.header}>
      <UIText color="soft">{t("app.groupDescription")}</UIText>
      <Controller
        control={control}
        name="groupName"
        render={({ field, fieldState }) => (
          <UIInput
            captionText={t("app.groupName")}
            placeholder={t("app.groupPlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={80}
          />
        )}
      />
      <View style={styles.peopleHeading}>
        <UIText size="md" weight="semibold" style={styles.grow}>
          {t("app.addPeople")}
        </UIText>
        {members.length > 0 ? (
          <UIText size="sm" weight="medium" color="link">
            {t("chat.selected", { count: members.length })}
          </UIText>
        ) : null}
      </View>
    </View>
  );

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
        title={t("chat.action")}
        isCompact={isHeaderCompact}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <Controller
        control={control}
        name="members"
        render={({ field }) => (
          <FlashList
            data={students}
            extraData={field.value}
            keyExtractor={(student) => student.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.list(headerHeight)}
            onEndReached={handleEndReached}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              isPending ? (
                <UISkeleton height={64} />
              ) : isError ? (
                <UIQueryError message={t("apiState.error")} onRetry={refetch} />
              ) : (
                <UIEmpty message={t("students.noResults")} />
              )
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <UISkeleton height={64} />
              ) : (
                <UIText size="sm" color="secondary" style={styles.hint}>
                  {t("app.minimumMembers")}
                </UIText>
              )
            }
            renderItem={({ item: student, index }) => {
              const isSelected = field.value.includes(student.id);
              const isFirst = index === 0;
              const isLast = index === students.length - 1;
              const handleRowPress = () =>
                field.onChange(
                  isSelected
                    ? field.value.filter((id) => id !== student.id)
                    : [...field.value, student.id],
                );
              return (
                <View style={styles.panel(isFirst, isLast)}>
                  <RowPickerItem
                    appearance="inset"
                    isMultiple
                    isSelected={isSelected}
                    isLast={isLast}
                    onPress={handleRowPress}
                    item={{
                      leading: <UIAvatar imageSrc={student.avatarUrl} />,
                      topText: authorName(student) || t("apiState.student"),
                      bottomLeading: (
                        <UIUniversityLogo
                          id={student.universityId}
                          size="xxs"
                        />
                      ),
                      bottomText:
                        universities.find(
                          ({ id }) => id === student.universityId,
                        )?.name ?? student.universityId.toUpperCase(),
                    }}
                  />
                </View>
              );
            }}
          />
        )}
      />
      {/* rides above the keyboard; UIPage's home-indicator gap is dropped while it's open */}
      <KeyboardStickyView
        offset={{ opened: bottomInset }}
        style={styles.footer}
      >
        <UIButton
          radius="sm"
          size="rg"
          accessibilityRole="button"
          disabled={!isValid}
          onPress={handleCreatePress}
          style={styles.create}
        >
          <Icon
            name="users"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
          <UIText size="rg" weight="semibold" color="black">
            {t("app.createGroup")}
          </UIText>
        </UIButton>
      </KeyboardStickyView>
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchClose}
        placeholder={t("app.searchStudents")}
        submitLabel={t("topbar.search")}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    // lets the empty-state cat fill the space under the header and centre in it
    flexGrow: 1,
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(8),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(16),
  }),
  header: {
    gap: theme.vs(24),
    paddingBottom: theme.vs(12),
  },
  peopleHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
  },
  grow: {
    flex: 1,
  },
  // each row draws its slice of the RowPicker "inset" panel, so the virtualized rows read as one panel
  panel: (isFirst: boolean, isLast: boolean) => ({
    paddingHorizontal: theme.s(6),
    paddingTop: isFirst ? theme.vs(6) : 0,
    paddingBottom: isLast ? theme.vs(6) : theme.vs(2),
    backgroundColor: theme.colors.white3,
    borderColor: theme.colors.white12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: isFirst ? 1 : 0,
    borderBottomWidth: isLast ? 1 : 0,
    borderTopLeftRadius: isFirst ? theme.vs(24) : 0,
    borderTopRightRadius: isFirst ? theme.vs(24) : 0,
    borderBottomLeftRadius: isLast ? theme.vs(24) : 0,
    borderBottomRightRadius: isLast ? theme.vs(24) : 0,
  }),
  hint: {
    paddingTop: theme.vs(4),
  },
  footer: {
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(12),
  },
  create: {
    flexDirection: "row",
    gap: theme.s(8),
  },
}));
