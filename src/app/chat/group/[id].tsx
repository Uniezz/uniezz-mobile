import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, LayoutChangeEvent, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { RenameGroupFormValues } from "@/@types";
import {
  useChatConversation,
  useChatMembers,
  useLeaveChatGroup,
  useMyProfile,
  useRemoveChatMember,
  useRenameChatGroup,
} from "@/hooks";
import { GroupMember } from "@/components/chat";
import { renameGroupSchema } from "@/schemas";
import {
  Icon,
  UIButton,
  UICollapsingHeader,
  UIIconButton,
  UIInput,
  UIPage,
  UIQueryError,
  UIText,
  UISkeletonRow,
} from "@/ui";
import { apiErrorKey } from "@/utils";

// a group's details: its name, its members, and leaving it
export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const { data: conversation } = useChatConversation(id);
  const { data: memberPage, isPending, isError, refetch } = useChatMembers(id);
  const members = memberPage?.items ?? [];
  const isOwner = conversation?.myRole === "owner";
  const { mutateAsync: rename, isPending: isRenaming } = useRenameChatGroup();
  const { mutateAsync: removeMember } = useRemoveChatMember(id);
  const { mutateAsync: leave, isPending: isLeaving } = useLeaveChatGroup(id);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<RenameGroupFormValues>({
    resolver: zodResolver(renameGroupSchema),
    values: { groupName: conversation?.name ?? "" },
    mode: "onChange",
  });
  // the header floats over the page; the name field starts below it and stays put while the members
  // scroll, so the header keeps its full size
  const [headerHeight, setHeaderHeight] = useState(0);

  const { bottom: bottomInset } = useSafeAreaInsets();
  const handleBackPress = () => router.back();
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  const handleRenamePress = handleSubmit(async ({ groupName }) => {
    try {
      const renamed = await rename({
        params: { path: { id } },
        body: { name: groupName },
      });
      reset({ groupName: renamed.name ?? groupName });
      toast.success(t("app.saved"));
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  });

  const handleAddPress = () =>
    router.push({ pathname: "/chat/new", params: { groupId: id } });

  const handleRemovePress = (userId: string, name: string) => {
    const confirmRemove = async () => {
      try {
        await removeMember({ params: { path: { id, userId } } });
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    };
    Alert.alert(t("chat.removeMemberTitle", { name }), undefined, [
      { text: t("postComposer.cancel"), style: "cancel" },
      { text: t("app.remove"), style: "destructive", onPress: confirmRemove },
    ]);
  };

  // the oldest member takes over an owner who leaves; the last one out deletes the group
  const handleLeavePress = () => {
    const confirmLeave = async () => {
      try {
        await leave({ params: { path: { id } } });
        router.dismissTo("/(tabs)/chat");
      } catch (error) {
        toast.error(t(apiErrorKey(error)));
      }
    };
    Alert.alert(t("chat.leaveGroupTitle"), t("chat.leaveGroupDescription"), [
      { text: t("postComposer.cancel"), style: "cancel" },
      {
        text: t("chat.leaveGroup"),
        style: "destructive",
        onPress: confirmLeave,
      },
    ]);
  };

  const membersHeading = (
    <View style={styles.membersHeading}>
      <UIText size="md" weight="semibold" style={styles.grow}>
        {t("chat.members", { count: members.length })}
      </UIText>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("app.addPeople")}
        onPress={handleAddPress}
      >
        <Icon name="plus" size={18} />
      </UIIconButton>
    </View>
  );

  // leaving sits in the header, red, as the one destructive action
  const headerActions = (
    <UIIconButton
      accessibilityRole="button"
      accessibilityLabel={t("chat.leaveGroup")}
      disabled={isLeaving}
      onPress={handleLeavePress}
    >
      <Icon
        name="log-out"
        size={18}
        uniProps={(theme) => ({ color: theme.colors.red })}
      />
    </UIIconButton>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={conversation?.name ?? ""}
        isCompact={false}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
        actions={headerActions}
      />
      <View style={styles.top(headerHeight)}>
        {isOwner ? (
          <Controller
            control={control}
            name="groupName"
            render={({ field, fieldState }) => (
              <UIInput
                captionText={t("app.groupName")}
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
        ) : null}
        {membersHeading}
      </View>
      <FlashList
        data={members}
        keyExtractor={(member) => member.student.id ?? member.joinedAt}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isPending ? (
            <UISkeletonRow isGlass count={4} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : null
        }
        renderItem={({ item: member, index }) => (
          <GroupMember
            member={member}
            isFirst={index === 0}
            isLast={index === members.length - 1}
            canRemove={isOwner && member.student.id !== profile?.id}
            onRemove={handleRemovePress}
          />
        )}
      />
      {/* a changed name brings Save, riding above the keyboard; UIPage's home-indicator gap is dropped
          while the keyboard is open */}
      {isDirty ? (
        <KeyboardStickyView
          offset={{ opened: bottomInset }}
          style={styles.footer}
        >
          <UIButton
            radius="sm"
            accessibilityRole="button"
            disabled={!isValid || isRenaming}
            onPress={handleRenamePress}
          >
            <UIText weight="semibold" color="black">
              {t("chat.saveName")}
            </UIText>
          </UIButton>
        </KeyboardStickyView>
      ) : null}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  top: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0) + theme.vs(8),
    paddingHorizontal: theme.s(16),
    gap: theme.vs(24),
  }),
  list: {
    paddingTop: theme.vs(12),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(16),
  },
  membersHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
  },
  grow: { flex: 1 },
  footer: {
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(12),
  },
}));
