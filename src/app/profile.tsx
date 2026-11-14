import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from "@react-native-menu/menu";
import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils/analytics";
import type { FlashListRef } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, LayoutChangeEvent, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useSession } from "@/contexts";
import {
  type Language,
  LANGUAGE_OPTIONS,
  LANGUAGES,
  useLanguageStore,
} from "@/store/languageStore";
import type { ProfileListItem } from "@/@types/profile";
import {
  PersonalDetailsSheet,
  PrivacySheet,
  ProfileHeader,
  ProfileOverview,
  ProfilePostList,
  ProgrammesSheet,
} from "@/components/profile";
import {
  useFeedPosts,
  useLikedFeedPosts,
  useSavedFeedPosts,
} from "@/hooks/useFeed";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useUploadImages } from "@/hooks/useMedia";
import {
  useDeleteMyAvatar,
  useDeleteMyBanner,
  useDeleteMyProfile,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/useMyProfile";
import { Icon, UIGlass, UIPage, UISubTabs } from "@/ui";
import { authorName, HEADER_COMPACT_OFFSET } from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";
import { ApiRequestError } from "@/api";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const posthog = usePostHog();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { mutateAsync: deleteAvatar, isPending: isRemovingPhoto } =
    useDeleteMyAvatar();
  const { mutateAsync: deleteBanner, isPending: isRemovingBanner } =
    useDeleteMyBanner();
  const { mutateAsync: deleteProfile, isPending: isDeletingProfile } =
    useDeleteMyProfile();
  const { mutateAsync: uploadImages, isPending: isUploadingPhoto } =
    useUploadImages("avatar");
  const { mutateAsync: uploadBanner, isPending: isUploadingBanner } =
    useUploadImages("banner");
  const { mutateAsync: updateProfile } = useUpdateMyProfile();
  const { clearSession } = useSession();
  const programmesRef = useRef<BottomSheetModal>(null);
  const detailsRef = useRef<BottomSheetModal>(null);
  const privacyRef = useRef<BottomSheetModal>(null);
  const { top: topInset } = useSafeAreaInsets();
  const [tabIndex, setTabIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const tabOffsets = useRef([0, 0, 0]);
  const overviewHeight = useRef(0);
  const headerOffset = Math.max(headerHeight - topInset, 0);

  const ownPostFilters = { authorId: profile?.id };
  const ownPosts = useFeedPosts(ownPostFilters, { enabled: Boolean(profile) });
  const likedPosts = useLikedFeedPosts();
  const savedPosts = useSavedFeedPosts();
  const ownListRef = useRef<FlashListRef<ProfileListItem>>(null);
  const likedListRef = useRef<FlashListRef<ProfileListItem>>(null);
  const savedListRef = useRef<FlashListRef<ProfileListItem>>(null);
  const listRefs = [ownListRef, likedListRef, savedListRef];
  const postTabs = [
    {
      query: ownPosts,
      emptyMessage: t("students.noPosts"),
      filters: ownPostFilters,
    },
    { query: likedPosts, emptyMessage: t("students.noLikedPosts") },
    { query: savedPosts, emptyMessage: t("students.noSavedPosts") },
  ];

  const handleListScroll = (index: number, offset: number) => {
    tabOffsets.current[index] = offset;
    if (index === tabIndex) setIsScrolled(offset > HEADER_COMPACT_OFFSET);
  };
  const handleOverviewLayout = (event: LayoutChangeEvent) => {
    overviewHeight.current = event.nativeEvent.layout.height;
  };
  const handleTabPress = (index: number) => {
    const current = tabOffsets.current[tabIndex] ?? 0;
    const own = tabOffsets.current[index] ?? 0;
    const pinnedAt = overviewHeight.current;
    const target = current < pinnedAt - 1 ? current : Math.max(own, pinnedAt);
    if (target !== own)
      listRefs[index]?.current?.scrollToOffset({
        offset: target,
        animated: false,
      });
    setIsScrolled(target > HEADER_COMPACT_OFFSET);
    setTabIndex(index);
  };
  const handleTabBarLayout = (event: LayoutChangeEvent) => {
    setTabBarHeight(event.nativeEvent.layout.height);
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

  const handleRemoveBannerPress = async () => {
    try {
      await deleteBanner();
      toast.success(t("app.saved"));
    } catch {
      toast.error(t("apiState.profileSaveError"));
    }
  };

  const handleChangeBannerPress = async () => {
    captureAction(posthog, "banner_pick", "attempted");
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 1],
      quality: 0.8,
    }).catch((error: unknown) => {
      captureAction(posthog, "banner_pick", "failed");
      throw error;
    });
    if (result.canceled) {
      captureAction(posthog, "banner_pick", "cancelled");
      return;
    }
    captureAction(posthog, "banner_pick", "succeeded");
    if (!result.assets[0]) return;
    const { uri, mimeType, fileSize } = result.assets[0];
    try {
      const [bannerMediaId] = await uploadBanner([{ uri, mimeType, fileSize }]);
      await updateProfile({ bannerMediaId });
      toast.success(t("app.saved"));
    } catch (error) {
      toast.error(t(apiErrorKey(error, "apiState.profileSaveError")));
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
      toast.error(t(apiErrorKey(error, "apiState.profileSaveError")));
    }
  };

  const handleLogoutPress = async () => {
    try {
      await clearSession();
    } catch {
      toast.error(t("auth.logoutError"));
    }
  };

  const confirmDeleteProfile = async () => {
    try {
      await deleteProfile();
      await clearSession();
    } catch (error) {
      toast.error(
        t(
          error instanceof ApiRequestError && error.status === 403
            ? "auth.reauthenticateToDelete"
            : apiErrorKey(error, "apiState.error"),
        ),
      );
    }
  };
  const handleDeleteProfilePress = () =>
    Alert.alert(
      t("auth.deleteAccountTitle"),
      t("auth.deleteAccountDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        {
          text: t("auth.deleteAccount"),
          style: "destructive",
          onPress: confirmDeleteProfile,
        },
      ],
    );

  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const handleLanguagePress = (code: Language) => {
    setLanguage(code);
  };
  const handleMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    const language = LANGUAGES.find((code) => nativeEvent.event === code);
    if (language) return handleLanguagePress(language);
    if (nativeEvent.event === "details") return detailsRef.current?.present();
    if (nativeEvent.event === "privacy") return privacyRef.current?.present();
    if (nativeEvent.event === "programmes")
      return programmesRef.current?.present();
    if (nativeEvent.event === "removePhoto") return handleRemovePhotoPress();
    if (nativeEvent.event === "changeBanner") return handleChangeBannerPress();
    if (nativeEvent.event === "removeBanner") return handleRemoveBannerPress();
    if (nativeEvent.event === "logout") return handleLogoutPress();
    if (nativeEvent.event === "deleteProfile")
      return handleDeleteProfilePress();
  };
  const menuActions: MenuAction[] = [
    { id: "details", title: t("app.personalDetails") },
    { id: "programmes", title: t("app.studyProgrammes") },
    { id: "privacy", title: t("app.profileVisibility") },
    { id: "changeBanner", title: t("app.changeBanner") },
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
    ...(profile?.bannerUrl && !isRemovingBanner && !isUploadingBanner
      ? [
          {
            id: "removeBanner",
            title: t("students.removeBanner"),
            attributes: { destructive: true },
          },
        ]
      : []),
    {
      id: "logout",
      title: t("auth.logOut"),
      attributes: { destructive: true },
    },
    {
      id: "deleteProfile",
      title: t("auth.deleteAccount"),
      attributes: { destructive: true, disabled: isDeletingProfile },
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

  const overview = (
    <View style={styles.overview} onLayout={handleOverviewLayout}>
      <ProfileOverview
        profile={profile}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        onChangePhoto={handleChangePhotoPress}
        isUploadingPhoto={isUploadingPhoto}
      />
    </View>
  );
  const renderTabBar = (isPinned: boolean) => (
    <View style={styles.tabBar} onLayout={handleTabBarLayout}>
      {isPinned ? (
        <BlurView intensity={50} tint="dark" style={styles.tabBarBlur} />
      ) : null}
      <UISubTabs
        items={[t("students.posts"), t("students.liked"), t("students.saved")]}
        selectedItemIndex={tabIndex}
        onPress={handleTabPress}
      />
    </View>
  );

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
      {profile ? (
        <View style={styles.lists}>
          {postTabs.map(({ query, emptyMessage, filters }, index) => (
            <ProfilePostList
              key={index}
              ref={listRefs[index]}
              index={index}
              query={query}
              emptyMessage={emptyMessage}
              filters={filters}
              overview={overview}
              renderTabBar={renderTabBar}
              headerOffset={headerOffset}
              tabBarHeight={tabBarHeight}
              isActive={index === tabIndex}
              onScroll={handleListScroll}
            />
          ))}
        </View>
      ) : (
        <View style={styles.loading(headerOffset)}>{overview}</View>
      )}
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

const styles = StyleSheet.create((theme) => ({
  lists: {
    flex: 1,
  },
  loading: (headerOffset: number) => ({
    paddingTop: headerOffset,
  }),
  overview: {
    paddingHorizontal: theme.s(20),
  },
  tabBar: {
    borderBottomWidth: theme.vs(1),
    borderBottomColor: theme.colors.white10,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.ink40,
  },
  more: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
}));
