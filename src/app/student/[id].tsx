import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  InterestChips,
  ProfileHero,
  ProgrammeCard,
  UniversityCard,
} from "@/components/profile";
import { ReportSheet } from "@/components/report";
import { usePublicProfile } from "@/hooks/useProfiles";
import { Icon, UIPage, UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName } from "@/utils";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: profile, isPending, isError, refetch } = usePublicProfile(id);
  const reportRef = useRef<BottomSheetModal>(null);

  const handleBackPress = () => router.back();
  const handleReportPress = () => reportRef.current?.present();
  const handleMessagePress = () => router.push("/(tabs)/chat");

  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.back")}
            onPress={handleBackPress}
            style={styles.headerButton}
          >
            <Icon name="arrow-left" size={18} />
          </Pressable>
          {profile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("report.user")}
              onPress={handleReportPress}
              style={styles.headerButton}
            >
              <Icon
                name="flag"
                size={18}
                uniProps={(theme) => ({ color: theme.colors.white60 })}
              />
            </Pressable>
          ) : null}
        </View>
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
            >
              {profile.bio ? (
                <UIText color="soft" style={styles.bio}>
                  {profile.bio}
                </UIText>
              ) : null}
              {profile.interests?.length ? (
                <InterestChips interests={profile.interests} />
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={handleMessagePress}
                style={styles.message}
              >
                <Icon
                  name="message-circle"
                  size={18}
                  uniProps={(theme) => ({ color: theme.colors.ink })}
                />
                <UIText size="rg" weight="semibold" color="black">
                  {t("app.message")}
                </UIText>
              </Pressable>
            </ProfileHero>
            <UniversityCard universityId={profile.universityId} />
            {profile.programmes?.length ? (
              <View style={styles.section}>
                <UIText size="md" weight="semibold">
                  {t("app.studyProgrammes")}
                </UIText>
                {profile.programmes.map((programme) => (
                  <ProgrammeCard
                    key={programme.programme}
                    programme={programme}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      <ReportSheet ref={reportRef} targetId={id} targetType="user" />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingTop: theme.vs(8),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
    gap: theme.vs(20),
  },
  header: {
    height: theme.vs(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: theme.vs(44),
    height: theme.vs(44),
    alignItems: "center",
    justifyContent: "center",
  },
  bio: {
    width: theme.s(300),
    textAlign: "center",
    lineHeight: theme.vs(15 * 1.45),
  },
  message: {
    height: theme.vs(48),
    paddingHorizontal: theme.s(28),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  section: {
    gap: theme.vs(12),
  },
}));
