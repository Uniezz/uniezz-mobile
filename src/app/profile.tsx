import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from "@react-native-menu/menu";
import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useSession } from "@/contexts";
import {
  InterestChips,
  PersonalDetailsSheet,
  PrivacySheet,
  ProfileHeader,
  ProfileHero,
  ProgrammeCard,
  ProgrammesSheet,
} from "@/components/profile";
import { FeedPostCard } from "@/components/feed";
import { useFeedPosts } from "@/hooks/useFeed";
import { launchImageLibraryAsync } from "expo-image-picker";
import { ApiRequestError } from "@/api";
import { useUploadImages } from "@/hooks/useMedia";
import {
  useDeleteMyAvatar,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/useMyProfile";
import { Icon, UIGlass, UIPage, UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName, FEED_HEADER_COMPACT_OFFSET } from "@/utils";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { mutateAsync: deleteAvatar, isPending: isRemovingPhoto } =
    useDeleteMyAvatar();
  const { mutateAsync: uploadImages, isPending: isUploadingPhoto } =
    useUploadImages("avatar");
  const { mutateAsync: updateProfile } = useUpdateMyProfile();
  const { clearSession } = useSession();
  const programmesRef = useRef<BottomSheetModal>(null);
  const detailsRef = useRef<BottomSheetModal>(null);
  const privacyRef = useRef<BottomSheetModal>(null);
  const postFilters = { authorId: profile?.id };
  const {
    data: postPages,
    isPending: arePostsPending,
    isError: arePostsError,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedPosts(postFilters, {
    enabled: Boolean(profile),
  });
  const posts = profile
    ? (postPages?.pages.flatMap((page) => page.items ?? []) ?? [])
    : [];
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  // the header floats over the list; scrolling blurs it and swaps its title for the name
  const [headerHeight, setHeaderHeight] = useState(0);
  // a boolean, so a scroll only re-renders when it flips
  const [isScrolled, setIsScrolled] = useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(
      event.nativeEvent.contentOffset.y > FEED_HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleBackPress = () => router.back();
  const handleDetailsSaved = () => detailsRef.current?.dismiss();
  const handlePrivacySaved = () => privacyRef.current?.dismiss();

  const handleRemovePhotoPress = async () => {
    try {
      await deleteAvatar();
      toast.success(t("app.saved"));
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  const handleChangePhotoPress = async () => {
    captureAction(posthog, "avatar_pick", "attempted");
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    }).catch((error: unknown) => {
      captureAction(posthog, "avatar_pick", "failed");
      throw error;
    });
    if (result.canceled) {
      captureAction(posthog, "avatar_pick", "cancelled");
      return;
    }
    captureAction(posthog, "avatar_pick", "succeeded");
    if (!result.assets[0]) return;
    const { uri, mimeType, fileSize } = result.assets[0];
    try {
      const [avatarMediaId] = await uploadImages([{ uri, mimeType, fileSize }]);
      await updateProfile({ avatarMediaId });
      toast.success(t("app.saved"));
    } catch (error) {
      toast.error(
        t(
          error instanceof ApiRequestError && error.translationKey
            ? error.translationKey
            : "apiState.profileSaveError",
        ),
      );
    }
  };

  const handleLogoutPress = async () => {
    try {
      await clearSession();
    } catch {
      toast.error(t("auth.logoutError"));
    }
  };

  const handleMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    if (nativeEvent.event === "details") return detailsRef.current?.present();
    if (nativeEvent.event === "privacy") return privacyRef.current?.present();
    if (nativeEvent.event === "programmes")
      return programmesRef.current?.present();
    if (nativeEvent.event === "removePhoto") return handleRemovePhotoPress();
    if (nativeEvent.event === "logout") return handleLogoutPress();
  };
  const menuActions: MenuAction[] = [
    { id: "details", title: t("app.personalDetails") },
    { id: "programmes", title: t("app.studyProgrammes") },
    { id: "privacy", title: t("app.profileVisibility") },
    ...(profile?.avatarUrl && !isRemovingPhoto
      ? [
          {
            id: "removePhoto",
            title: t("students.removePhoto"),
            attributes: { destructive: true },
          },
        ]
      : []),
    {
      id: "logout",
      title: t("auth.logOut"),
      attributes: { destructive: true },
    },
  ];
  const headerAction = profile ? (
    <MenuView actions={menuActions} onPressAction={handleMenuAction}>
      <UIGlass
        radius={12}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t("app.moreOptions")}
        style={styles.more}
      >
        <Icon name="ellipsis" size={18} />
      </UIGlass>
    </MenuView>
  ) : null;

  return (
    <UIPage>
      <ProfileHeader
        title={t("app.profile")}
        name={profile ? authorName(profile) || t("apiState.student") : ""}
        avatarUrl={profile?.avatarUrl}
        universityId={profile?.universityId}
        isScrolled={isScrolled}
        action={headerAction}
        onLayout={handleHeaderLayout}
        onBackPress={handleBackPress}
      />
      <FlashList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.page}>
            {isPending ? (
              <UISkeleton height={220} />
            ) : isError || !profile ? (
              <UIQueryError message={t("apiState.error")} onRetry={refetch} />
            ) : (
              <>
                <ProfileHero
                  avatar={profile.avatarUrl}
                  name={authorName(profile) || t("apiState.student")}
                  subtitle={profile.email}
                  universityId={profile.universityId}
                  onAvatarPress={handleChangePhotoPress}
                  avatarLabel={t("app.changePhoto")}
                  isAvatarDisabled={isUploadingPhoto}
                >
                  {profile.bio ? (
                    <UIText size="rg" color="soft" style={styles.bio}>
                      {profile.bio}
                    </UIText>
                  ) : null}
                  {profile.interests?.length ? (
                    <InterestChips interests={profile.interests} />
                  ) : null}
                </ProfileHero>
                <View style={styles.section}>
                  <UIText size="md" weight="semibold">
                    {t("app.studyProgrammes")}
                  </UIText>
                  {(profile.programmes ?? []).map((item) => (
                    <ProgrammeCard key={item.id} programme={item} />
                  ))}
                </View>
                <UIText size="md" weight="semibold">
                  {t("students.posts")}
                </UIText>
              </>
            )}
          </View>
        }
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list(headerHeight)}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          !profile ? null : arePostsPending ? (
            <UISkeleton height={120} />
          ) : arePostsError ? (
            <UIQueryError
              message={t("apiState.error")}
              onRetry={refetchPosts}
            />
          ) : (
            <UIText color="secondary">{t("students.noPosts")}</UIText>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={110} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FeedPostCard post={item} filters={postFilters} />
          </View>
        )}
      />
      {profile ? (
        <>
          <PersonalDetailsSheet
            ref={detailsRef}
            profile={profile}
            onSaved={handleDetailsSaved}
          />
          <PrivacySheet
            ref={privacyRef}
            privacy={profile.privacy}
            onSaved={handlePrivacySaved}
          />
        </>
      ) : null}
      <ProgrammesSheet
        ref={programmesRef}
        programmes={profile?.programmes ?? []}
        universityId={profile?.universityId ?? ""}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
  }),
  page: {
    paddingBottom: theme.vs(12),
    gap: theme.vs(20),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
  bio: {
    lineHeight: theme.vs(24),
  },
  section: {
    gap: theme.vs(12),
  },
  more: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
}));
