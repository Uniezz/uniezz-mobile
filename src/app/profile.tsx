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
import { Alert, LayoutChangeEvent, View } from "react-native";
import { type CollapsibleRef, Tabs } from "react-native-collapsible-tab-view";
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
import {
  HeaderScrollWatcher,
  LikedPosts,
  OwnPosts,
  PersonalDetailsSheet,
  PrivacySheet,
  ProfileHeader,
  ProfileOverview,
  ProgrammesSheet,
  SavedPosts,
} from "@/components/profile";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useUploadImages } from "@/hooks/useMedia";
import {
  useDeleteMyAvatar,
  useDeleteMyBanner,
  useDeleteMyProfile,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/useMyProfile";
import { Icon, UIGlass, UIPage, UISegmented } from "@/ui";
import { authorName } from "@/utils";
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
  const tabsRef = useRef<CollapsibleRef>(null);
  // own posts, liked posts or saved posts; the switch and a swipe both change it
  const [tabIndex, setTabIndex] = useState(0);
  // the header floats over the tabs; scrolling blurs it and swaps its title for the name
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  // UIPage already pads the status bar; the rest of the floating header stays over the tabs
  const headerOffset = Math.max(headerHeight - topInset, 0);
  const handleTabPress = (index: number) => tabsRef.current?.setIndex(index);
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

  const renderTabsHeader = () => (
    <View style={styles.overview}>
      <View style={styles.spacer(headerOffset)} />
      <ProfileOverview
        profile={profile}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        onChangePhoto={handleChangePhotoPress}
        isUploadingPhoto={isUploadingPhoto}
      />
      <HeaderScrollWatcher onScrolledChange={setIsScrolled} />
    </View>
  );
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <UISegmented
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
      {/* waits for the floating header's height, so the tabs start with the right minHeaderHeight */}
      {profile && headerHeight > 0 ? (
        // the overview scrolls away under the floating header; the switch sticks below it
        <Tabs.Container
          ref={tabsRef}
          lazy
          minHeaderHeight={headerOffset}
          onIndexChange={setTabIndex}
          headerContainerStyle={styles.tabsHeader}
          renderHeader={renderTabsHeader}
          renderTabBar={renderTabBar}
        >
          <Tabs.Tab name="posts">
            <OwnPosts authorId={profile.id} />
          </Tabs.Tab>
          <Tabs.Tab name="liked">
            <LikedPosts />
          </Tabs.Tab>
          <Tabs.Tab name="saved">
            <SavedPosts />
          </Tabs.Tab>
        </Tabs.Container>
      ) : (
        <View style={styles.overview}>
          <View style={styles.spacer(headerOffset)} />
          <ProfileOverview
            profile={profile}
            isPending={isPending}
            isError={isError}
            onRetry={refetch}
            onChangePhoto={handleChangePhotoPress}
            isUploadingPhoto={isUploadingPhoto}
          />
        </View>
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
  // transparent, so posts show through the floating header's blur once the overview is gone
  tabsHeader: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  overview: {
    paddingHorizontal: theme.s(20),
  },
  spacer: (height: number) => ({ height }),
  tabBar: {
    paddingHorizontal: theme.s(20),
    paddingVertical: theme.vs(8),
    backgroundColor: theme.colors.ink,
  },
  more: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
}));
