import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, LayoutChangeEvent, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UICollapsingHeader,
  UIEmpty,
  UIIconButton,
  UIPage,
  UISearchOverlay,
  UIText,
} from "@/ui";

// shortcut: empty state only, like the web FAQ page; add a list (and filter it by the search) once the backend has an FAQ endpoint
export default function FaqScreen() {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // the header floats over the content, which starts below it
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  // the search field only exists while the keyboard is up; blurring it closes it
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchClose = () => setIsSearching(false);
  const handleAskPress = () => router.push("/feed/new");
  const handleProfilePress = () => router.push("/profile");

  const headerActions = (
    <>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("topbar.search")}
        onPress={handleSearchPress}
      >
        <Icon name="search" size={18} />
      </UIIconButton>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("app.newPost")}
        onPress={handleAskPress}
      >
        <Icon name="message-circle-plus" size={18} />
      </UIIconButton>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("app.profile")}
        onPress={handleProfilePress}
      >
        <UIAvatar imageSrc={profile?.avatarUrl} />
      </Pressable>
    </>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("tabs.faq")}
        isCompact={false}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <View style={styles.content(headerHeight)}>
        {/* under the title, as in the design; a header subtitle would sit above it and shift the row off the other tabs' */}
        <UIText color="secondary">{t("faq.subtitle")}</UIText>
      </View>
      <UIEmpty isScreenCentred message={t("faq.empty")} />
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={Keyboard.dismiss}
        onClose={handleSearchClose}
        placeholder={t("faq.search")}
        submitLabel={t("topbar.search")}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  content: (headerHeight: number) => ({
    flex: 1,
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
}));
