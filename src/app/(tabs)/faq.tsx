import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  Icon,
  UIAvatar,
  UIEmpty,
  UIIconButton,
  UIPage,
  UISearch,
  UIText,
} from "@/ui";

// shortcut: empty state only, like the web FAQ page; add a list once the backend has an FAQ endpoint
export default function FaqScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  return (
    <UIPage>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.title}>
            <UIText size="xl" weight="bold" style={styles.h1}>
              {t("tabs.faq")}
            </UIText>
            <UIText size="sm" color="secondary">
              {t("faq.subtitle")}
            </UIText>
          </View>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.newPost")}
            onPress={() => router.push("/feed/new")}
          >
            <Icon name="message-circle-plus" size={18} />
          </UIIconButton>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.profile")}
            onPress={() => router.push("/profile")}
          >
            <UIAvatar />
          </Pressable>
        </View>
        <UISearch
          placeholder={t("topbar.search")}
          value={search}
          onChangeText={setSearch}
        />
        <UIEmpty message={t("faq.empty")} />
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    // lets the empty-state cat fill the space under the header and centre in it
    flexGrow: 1,
    paddingTop: theme.vs(4),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
    gap: theme.vs(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  title: {
    flex: 1,
    gap: theme.vs(4),
  },
  h1: {
    lineHeight: theme.vs(30),
  },
}));
