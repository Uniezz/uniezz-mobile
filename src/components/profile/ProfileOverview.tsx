import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Profile } from "@/@types/profile";
import { UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName } from "@/utils";
import { InterestChips } from "./InterestChips";
import { ProfileHero } from "./ProfileHero";
import { ProgrammeCard } from "./ProgrammeCard";

type ProfileOverviewProps = {
  profile: Profile | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onChangePhoto: () => void;
  isUploadingPhoto: boolean;
};

// the profile list header: identity, programmes, and the posts section title
export const ProfileOverview = ({
  profile,
  isPending,
  isError,
  onRetry,
  onChangePhoto,
  isUploadingPhoto,
}: ProfileOverviewProps) => {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <View style={styles.page}>
        <UISkeleton height={220} />
      </View>
    );
  }
  if (isError || !profile) {
    return (
      <View style={styles.page}>
        <UIQueryError message={t("apiState.error")} onRetry={onRetry} />
      </View>
    );
  }
  return (
    <View style={styles.page}>
      <ProfileHero
        avatar={profile.avatarUrl}
        name={authorName(profile) || t("apiState.student")}
        subtitle={profile.email}
        universityId={profile.universityId}
        onAvatarPress={onChangePhoto}
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
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingBottom: theme.vs(12),
    gap: theme.vs(20),
  },
  bio: {
    lineHeight: theme.vs(24),
  },
  section: {
    gap: theme.vs(12),
  },
}));
