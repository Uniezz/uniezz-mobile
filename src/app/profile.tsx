import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import type { Programme } from "@/@types/profile";
import { useSession } from "@/contexts";
import { AddProgrammeForm, PersonalDetailsForm } from "@/components/profile";
import {
  useDeleteMyProgramme,
  useMyProfile,
  useReplaceMyProgramme,
} from "@/hooks/useMyProfile";
import { UIAvatar, UIButton, UIGlass, UIPage, UIText } from "@/ui";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const { mutate: replaceProgramme } = useReplaceMyProgramme();
  const { mutateAsync: deleteProgramme } = useDeleteMyProgramme();
  const { clearSession } = useSession();
  const [editing, setEditing] = useState(false);
  const [addingProgramme, setAddingProgramme] = useState(false);

  const makePrimary = (item: Programme) =>
    replaceProgramme(
      {
        id: item.id,
        body: {
          programme: item.programme,
          faculty: item.faculty,
          status: item.status,
          isPrimary: true,
          yearOfStudy: item.yearOfStudy ?? undefined,
          level: item.level ?? undefined,
          modeOfStudies: item.modeOfStudies ?? undefined,
        },
      },
      { onError: () => toast.error(t("apiState.profileSaveError")) },
    );

  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          >
            <UIText size="lg">‹</UIText>
          </Pressable>
          <UIText size="lg" weight="bold">
            Profile
          </UIText>
        </View>
        {isPending ? (
          <UIText color="secondary">Loading profile…</UIText>
        ) : isError || !profile ? (
          <UIButton type="secondary" onPress={() => refetch()}>
            <UIText>Couldn’t load profile. Retry</UIText>
          </UIButton>
        ) : (
          <>
            <View style={styles.identity}>
              <UIAvatar
                size="xl"
                imageSrc={
                  profile.avatarUrl ?? require("../../assets/profile-cat.png")
                }
                placeholderText={`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`}
              />
              <View style={styles.identityText}>
                <UIText size="lg" weight="bold">
                  {[profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" ") || "Student"}
                </UIText>
                <UIText color="secondary">
                  {profile.email ?? "University student"}
                </UIText>
              </View>
            </View>
            <View style={styles.section}>
              <UIText size="md" weight="bold">
                University
              </UIText>
              <UIText color="soft">{profile.universityId.toUpperCase()}</UIText>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <UIText size="md" weight="bold">
                  Personal details
                </UIText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditing(!editing)}
                >
                  <UIText color="link">{editing ? "Cancel" : "Edit"}</UIText>
                </Pressable>
              </View>
              {editing && (
                <PersonalDetailsForm
                  firstName={profile.firstName ?? ""}
                  lastName={profile.lastName ?? ""}
                  onSaved={() => setEditing(false)}
                />
              )}
            </View>
            <View style={styles.section}>
              <UIText size="md" weight="bold">
                Study programmes
              </UIText>
              {(profile.programmes ?? []).map((item) => (
                <UIGlass key={item.id} style={styles.programme}>
                  <View style={styles.sectionHeader}>
                    <UIText weight="semibold">{item.programme}</UIText>
                    {item.isPrimary && (
                      <UIText size="xs" color="link">
                        PRIMARY
                      </UIText>
                    )}
                  </View>
                  <UIText size="sm" color="secondary">
                    {item.faculty}
                  </UIText>
                  {!item.isPrimary && (
                    <View style={styles.programmeActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => makePrimary(item)}
                      >
                        <UIText color="link">Make primary</UIText>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          Alert.alert("Remove programme?", item.programme, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () => {
                                void deleteProgramme(item.id).catch(() =>
                                  toast.error(t("apiState.profileSaveError")),
                                );
                              },
                            },
                          ])
                        }
                      >
                        <UIText color="error">Remove</UIText>
                      </Pressable>
                    </View>
                  )}
                </UIGlass>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={() => setAddingProgramme(!addingProgramme)}
              >
                <UIText color="link">+ Add study programme</UIText>
              </Pressable>
              {addingProgramme && (
                <AddProgrammeForm
                  isPrimary={!profile.programmes?.length}
                  onSaved={() => setAddingProgramme(false)}
                />
              )}
            </View>
            <UIButton
              type="secondary"
              onPress={async () => {
                try {
                  await clearSession();
                } catch {
                  toast.error(t("auth.logoutError"));
                }
              }}
            >
              <UIText>Log out</UIText>
            </UIButton>
          </>
        )}
      </ScrollView>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
    gap: theme.vs(20),
  },
  header: {
    height: theme.vs(52),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(16),
  },
  identity: { flexDirection: "row", alignItems: "center", gap: theme.s(16) },
  identityText: { flex: 1, gap: theme.vs(5) },
  section: { gap: theme.vs(12) },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  programme: { padding: theme.s(16), gap: theme.vs(8) },
  programmeActions: {
    flexDirection: "row",
    gap: theme.s(20),
    paddingTop: theme.vs(4),
  },
}));
