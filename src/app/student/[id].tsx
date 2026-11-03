import { useLocalSearchParams, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { usePublicProfile } from "@/hooks/useProfiles";
import {
  UIAvatar,
  UIGlass,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: profile, isPending, isError, refetch } = usePublicProfile(id);
  return (
    <UIPage backdrop="city">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <UIText color="link">‹ Back</UIText>
        </Pressable>
        {isPending ? (
          <UISkeleton height={180} />
        ) : isError || !profile ? (
          <UIQueryError message="Couldn’t load profile" onRetry={refetch} />
        ) : (
          <>
            <UIGlass style={{ padding: 18, gap: 12 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <UIAvatar imageSrc={profile.avatarUrl ?? undefined} />
                <UIText size="lg" weight="bold">
                  {[profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </UIText>
              </View>
              {profile.bio ? <UIText>{profile.bio}</UIText> : null}
              {profile.email ? (
                <UIText color="secondary">{profile.email}</UIText>
              ) : null}
            </UIGlass>
            {(profile.programmes ?? []).map((programme) => (
              <UIGlass
                key={programme.programme}
                style={{ padding: 16, gap: 8 }}
              >
                <UIText weight="semibold">{programme.programme}</UIText>
                {programme.faculty ? (
                  <UIText color="secondary">{programme.faculty}</UIText>
                ) : null}
                {programme.yearOfStudy ? (
                  <UIText color="secondary">
                    Year {programme.yearOfStudy}
                  </UIText>
                ) : null}
              </UIGlass>
            ))}
          </>
        )}
      </ScrollView>
    </UIPage>
  );
}
