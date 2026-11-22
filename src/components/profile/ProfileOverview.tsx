import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { Profile, ProfileGalleryPhoto } from "@/@types";
import { UIQueryError, UISkeleton, UIText } from "@/ui";
import { authorName } from "@/utils";
import { InterestChips } from "./InterestChips";
import { ProfileHero } from "./ProfileHero";
import { ProfilePhotos } from "./ProfilePhotos";
import { ProgrammeCard } from "./ProgrammeCard";

type ProfileOverviewProps = {
  profile: Profile | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onChangePhoto: () => void;
  isUploadingPhoto: boolean;
  photos: ProfileGalleryPhoto[];
  onAddPhotos: () => void;
  isAddingPhotos: boolean;
  onRemovePhoto: (id: string) => void;
};

// the profile list header: identity, programmes, and the posts section title
export const ProfileOverview = ({
  profile,
  isPending,
  isError,
  onRetry,
  onChangePhoto,
  isUploadingPhoto,
  photos,
  onAddPhotos,
  isAddingPhotos,
  onRemovePhoto,
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
        bannerUrl={profile.bannerUrl}
        songUrl={profile.songUrl}
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
      <ProfilePhotos
        photos={photos}
        onAddPress={onAddPhotos}
        isAdding={isAddingPhotos}
        onRemovePress={onRemovePhoto}
      />
      {profile.programmes?.length ? (
        <View style={styles.section}>
          <UIText size="md" weight="semibold">
            {t("app.studyProgrammes")}
          </UIText>
          {profile.programmes.map((item) => (
            <ProgrammeCard key={item.id} programme={item} />
          ))}
        </View>
      ) : null}
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
