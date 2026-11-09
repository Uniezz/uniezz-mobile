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
  type Language,
  LANGUAGE_OPTIONS,
  LANGUAGES,
  useLanguageStore,
} from "@/store/languageStore";
import {
  PersonalDetailsSheet,
  PrivacySheet,
  ProfileHeader,
  ProfileOverview,
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
import { authorName, HEADER_COMPACT_OFFSET } from "@/utils";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
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
    setIsScrolled(event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET);
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

  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const handleLanguagePress = (code: Language) => {
    setLanguage(code);
    updateProfile({ language: code }).catch(() =>
      toast.error(t("apiState.profileSaveError")),
    );
  };
  const handleMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    const language = LANGUAGES.find((code) => nativeEvent.event === code);
    if (language) return handleLanguagePress(language);
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
    {
      id: "language",
      title: t("language.title"),
      subactions: LANGUAGE_OPTIONS.map(({ code, flag, label }) => ({
        id: code,
        title: `${flag} ${label}`,
        state: code === i18n.resolvedLanguage ? "on" : "off",
      })),
    },
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
          <ProfileOverview
            profile={profile}
            isPending={isPending}
            isError={isError}
            onRetry={refetch}
            onChangePhoto={handleChangePhotoPress}
            isUploadingPhoto={isUploadingPhoto}
          />
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
  cell: {
    paddingBottom: theme.vs(16),
  },
  more: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
}));
