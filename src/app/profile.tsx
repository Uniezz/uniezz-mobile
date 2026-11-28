import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from "@react-native-menu/menu";
import {
  authorName,
  HEADER_COMPACT_OFFSET,
  apiErrorKey,
  MAX_PROFILE_PHOTOS,
} from "@/utils";
import type { FlashListRef } from "@shopify/flash-list";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LayoutChangeEvent,
  Linking,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeatureFlag } from "posthog-react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { useSession } from "@/contexts";
import {
  type Language,
  LANGUAGE_OPTIONS,
  LANGUAGES,
  useLanguageStore,
} from "@/store/languageStore";
import { useHapticsStore } from "@/store/hapticsStore";
import * as Haptics from "expo-haptics";
import type { ProfileListItem } from "@/@types";
import {
  PersonalDetailsSheet,
  PrivacySheet,
  ProfileHeader,
  ProfileOverview,
  ProfilePostList,
  ProgrammesSheet,
} from "@/components/profile";
import { CoinBalance } from "@/components/rewards";
import {
  useFeedPosts,
  useLikedFeedPosts,
  useSavedFeedPosts,
  useDeleteMyAvatar,
  useDeleteMyBanner,
  useDeleteMyProfile,
  useDeleteMyProfilePhoto,
  useMyProfile,
  useMyProfilePhotos,
  useDeleteMyPushToken,
  useMyPushSettings,
  useNotificationPermission,
  useUpdateMyPushSettings,
  usePickProfileImage,
  usePickProfilePhotos,
  useRequestNotificationPermission,
  useUpdateMyProfile,
} from "@/hooks";
import { Icon, UIGlass, UIPage, UISubTabs, UIBlur } from "@/ui";
import { ApiRequestError } from "@/api";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { mutateAsync: deleteAvatar, isPending: isRemovingPhoto } =
    useDeleteMyAvatar();
  const { mutateAsync: deleteBanner, isPending: isRemovingBanner } =
    useDeleteMyBanner();
  const { mutateAsync: deleteProfile, isPending: isDeletingProfile } =
    useDeleteMyProfile();
  const { pickImage: handleChangePhotoPress, isPending: isUploadingPhoto } =
    usePickProfileImage("avatar");
  const { pickImage: handleChangeBannerPress, isPending: isUploadingBanner } =
    usePickProfileImage("banner");
  const { data: photoList } = useMyProfilePhotos();
  const photos = photoList?.photos ?? [];
  const galleryPhotos = photos.map(({ url, id, isAvatar }) => ({
    url,
    // the avatar is removed from the menu, through its own endpoint
    id: isAvatar ? undefined : id,
  }));
  const { pickPhotos: handleAddPhotosPress, isPending: isAddingPhotos } =
    usePickProfilePhotos(MAX_PROFILE_PHOTOS - photos.length);
  const { mutateAsync: deletePhoto } = useDeleteMyProfilePhoto();
  const { isEnabled: areNotificationsEnabled, canAsk: canAskNotifications } =
    useNotificationPermission();
  const { mutateAsync: requestNotifications } =
    useRequestNotificationPermission();
  const { data: pushSettings } = useMyPushSettings();
  const { mutateAsync: updatePushSettings } = useUpdateMyPushSettings();
  const { mutateAsync: deletePushToken } = useDeleteMyPushToken();
  // on only when the system allows them and the account has not switched them off
  const arePushesOn =
    areNotificationsEnabled && pushSettings?.enabled !== false;
  const { clearSession } = useSession();
  const coinsEnabled = useFeatureFlag("coins") !== false;
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

  // where a tab's list must sit to match the shown one: the same offset while the overview shows, at least pinned after
  const syncedOffset = (current: number, own: number) => {
    const pinnedAt = overviewHeight.current;
    return current < pinnedAt - 1 ? current : Math.max(own, pinnedAt);
  };
  const handleListScroll = (index: number, offset: number) => {
    tabOffsets.current[index] = offset;
    if (index !== tabIndex) return;
    setIsScrolled(offset > HEADER_COMPACT_OFFSET);
    // Android applies scrollTo a frame late, so a list scrolled and shown in the same tap jerks;
    // there the hidden lists follow now and a tab switch scrolls nothing. iOS scrolls at once.
    if (Platform.OS !== "android") return;
    listRefs.forEach((ref, other) => {
      if (other === index) return;
      const own = tabOffsets.current[other] ?? 0;
      const target = syncedOffset(offset, own);
      if (target === own) return;
      tabOffsets.current[other] = target;
      ref.current?.scrollToOffset({ offset: target, animated: false });
    });
  };
  const handleOverviewLayout = (event: LayoutChangeEvent) => {
    overviewHeight.current = event.nativeEvent.layout.height;
  };
  const handleTabPress = (index: number) => {
    const current = tabOffsets.current[tabIndex] ?? 0;
    const own = tabOffsets.current[index] ?? 0;
    const target = syncedOffset(current, own);
    // on Android the list is already in place after handleListScroll
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

  const handleRemoveGalleryPhotoPress = async (id: string) => {
    try {
      await deletePhoto(id);
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

  // once the system allows them, the switch is the account's; before that the app can ask only once,
  // and after a refusal only the system settings can turn them on
  const handleNotificationsPress = () => {
    if (areNotificationsEnabled) return handleTogglePushes();
    if (!canAskNotifications) return Linking.openSettings();
    Alert.alert(
      t("app.notificationsPromptTitle"),
      t("app.notificationsPromptMessage"),
      [
        { text: t("app.notNow"), style: "cancel" },
        {
          text: t("app.notificationsEnable"),
          onPress: handleEnableNotifications,
        },
      ],
    );
  };
  const handleEnableNotifications = async () => {
    try {
      const { granted } = await requestNotifications();
      if (!granted) return;
      if (pushSettings?.enabled === false) {
        await updatePushSettings({ body: { enabled: true } });
      }
    } catch {
      toast.error(t("apiState.error"));
    }
  };
  const handleTogglePushes = async () => {
    try {
      await updatePushSettings({ body: { enabled: !arePushesOn } });
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  };

  const handleLogoutPress = async () => {
    // the device stops getting this account's pushes; signing out goes on without it
    await deletePushToken({}).catch(() => undefined);
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
  const { enabled: hapticEnabled, toggleEnabled: toggleHaptics } =
    useHapticsStore();
  const { mutate: updateProfile } = useUpdateMyProfile();
  const handleLanguagePress = (code: Language) => {
    setLanguage(code);
    // saved in the background so push notifications come in this language too
    updateProfile({ language: code });
  };
  const handleMenuAction = ({ nativeEvent }: NativeActionEvent) => {
    const language = LANGUAGES.find((code) => nativeEvent.event === code);
    if (language) return handleLanguagePress(language);
    if (nativeEvent.event === "haptics") {
      toggleHaptics();
      if (useHapticsStore.getState().enabled) void Haptics.selectionAsync();
      return;
    }
    if (nativeEvent.event === "notifications")
      return handleNotificationsPress();
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
    {
      id: "notifications",
      title: t("topbar.notifications"),
      state: arePushesOn ? "on" : "off",
    },
    {
      id: "haptics",
      title: t("app.haptics"),
      state: hapticEnabled ? "on" : "off",
    },
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
  // the coin balance sits beside the menu and opens the rewards screen
  const headerAction = profile ? (
    <View style={styles.headerActions}>
      {coinsEnabled ? <CoinBalance coins={profile.coins} /> : null}
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
    </View>
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
        photos={galleryPhotos}
        onAddPhotos={handleAddPhotosPress}
        isAddingPhotos={isAddingPhotos}
        onRemovePhoto={handleRemoveGalleryPhotoPress}
      />
    </View>
  );
  const renderTabBar = (isPinned: boolean) => (
    <View style={styles.tabBar} onLayout={handleTabBarLayout}>
      {isPinned ? (
        <UIBlur intensity={50} tint="dark" style={styles.tabBarBlur} />
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
    // Android has no real blur: an opaque fill, so nothing scrolls through
    backgroundColor:
      Platform.OS === "android" ? theme.colors.ink : theme.colors.ink40,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  more: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
}));
