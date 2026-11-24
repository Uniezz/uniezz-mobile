import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
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
  Platform,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CreateGroupFormValues } from "@/@types";
import { RowPickerItem } from "@/components";
import {
  useAddChatMembers,
  useChatMembers,
  useConnections,
  useCreateChatGroup,
  useUniversities,
} from "@/hooks";
import { addGroupMembersSchema, createGroupSchema } from "@/schemas";
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
  UIText,
  UIUniversityLogo,
  UIBlur,
  UISkeletonRow,
} from "@/ui";
import {
  apiErrorKey,
  authorName,
  captureAction,
  HEADER_COMPACT_OFFSET,
} from "@/utils";

// creates a group, or with a groupId adds people to that group
export default function NewGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const isAdding = Boolean(groupId);
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { createGroup, isPending: isCreating } = useCreateChatGroup();
  const { mutateAsync: addMembers, isPending: isAddingMembers } =
    useAddChatMembers(groupId ?? "");
  const { data: memberPage } = useChatMembers(groupId ?? "", isAdding);
  const memberIds = new Set(
    (memberPage?.items ?? []).map(({ student }) => student.id),
  );
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
  } = useConnections();
  // the API takes only the student's own connections into a group.
  // shortcut: search filters the loaded connections; the API has no connection search yet
  const needle = query.trim().toLowerCase();
  const students = (data?.pages.flatMap((page) => page.items ?? []) ?? [])
    .map(({ profile }) => profile)
    // people already in the group are not offered again
    .filter(
      (student) =>
        !memberIds.has(student.id) &&
        authorName(student).toLowerCase().includes(needle),
    );
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(isAdding ? addGroupMembersSchema : createGroupSchema),
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
    async ({ groupName, members: picked }) => {
      try {
        if (groupId) {
          await addMembers({
            params: { path: { id: groupId } },
            body: { userIds: picked },
          });
          router.back();
          return;
        }
        const { id } = await createGroup({
          name: groupName,
          memberIds: picked,
        });
        // replaces this form, so back from the new group returns to the chat list
        router.replace({ pathname: "/chat/[id]", params: { id } });
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    },
    () => captureAction(posthog, "group_form", "validation_failed"),
  );

  const listHeader = (
    <View style={styles.header}>
      {isAdding ? null : (
        <>
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
                errorText={
                  fieldState.error?.message && t(fieldState.error.message)
                }
                maxLength={80}
              />
            )}
          />
        </>
      )}
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
        title={t(isAdding ? "app.addPeople" : "chat.action")}
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
                <UISkeletonRow isGlass count={8} />
              ) : isError ? (
                <UIQueryError message={t("apiState.error")} onRetry={refetch} />
              ) : null
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <UISkeletonRow isGlass />
              ) : isAdding ? null : (
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
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!isPending && !isError && students.length === 0 ? (
        <UIEmpty isScreenCentred message={t("students.noResults")} />
      ) : null}
      {/* rides above the keyboard; UIPage's home-indicator gap is dropped while it's open */}
      <KeyboardStickyView
        offset={{ opened: bottomInset }}
        style={styles.footer}
      >
        {/* over the list once the keyboard lifts it; blurred like the headers, so a disabled (see-through) button stays readable */}
        <UIBlur intensity={50} tint="dark" style={styles.footerBlur} />
        <UIButton
          radius="sm"
          size="rg"
          accessibilityRole="button"
          disabled={!isValid || isCreating || isAddingMembers}
          onPress={handleCreatePress}
          style={styles.create}
        >
          <Icon
            name="users"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
          <UIText size="rg" weight="semibold" color="black">
            {t(isAdding ? "chat.addToGroup" : "app.createGroup")}
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
  footerBlur: {
    ...StyleSheet.absoluteFillObject,
    // Android has no real blur: an opaque fill, so nothing scrolls through
    backgroundColor:
      Platform.OS === "android" ? theme.colors.ink : theme.colors.ink40,
  },
  create: {
    flexDirection: "row",
    gap: theme.s(8),
  },
}));
