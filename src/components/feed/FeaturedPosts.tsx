import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useFeaturedFeedPosts } from "@/hooks/useFeed";
import { Icon, UIFadeScrollView, UIImage, UIText } from "@/ui";
import { isLive } from "@/utils";

export const FeaturedPosts = () => {
  const { t, i18n } = useTranslation();
  const { data: { items: events } = { items: [] } } = useFeaturedFeedPosts();
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "en", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <UIFadeScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.row}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/feed/new")}
        style={styles.add}
      >
        <View style={styles.plus}>
          <Icon
            name="plus"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
        </View>
        <UIText size="xs" weight="semibold" style={styles.addLabel}>
          {t("app.newPost")}
        </UIText>
      </Pressable>
      {events?.map((event) => {
        const live = isLive(event.eventDate);
        return (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            accessibilityLabel={event.title}
            onPress={() =>
              router.push({
                pathname: "/post/[id]",
                params: { id: event.id },
              })
            }
            style={styles.story}
          >
            <UIImage
              source={{ uri: event.imageUrl }}
              fallback={undefined}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.shade} />
            {event.eventDate ? (
              <View style={styles.time(live)}>
                <UIText size="xs" weight="semibold">
                  {live
                    ? t("app.liveNow")
                    : time.format(new Date(event.eventDate))}
                </UIText>
              </View>
            ) : (
              <View />
            )}
            <UIText
              size="xs"
              weight="semibold"
              numberOfLines={2}
              style={styles.storyTitle}
            >
              {event.title}
            </UIText>
          </Pressable>
        );
      })}
    </UIFadeScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  // the row runs to the screen edges under the scroll fades, its first tile still at the page inset
  bleed: {
    marginHorizontal: -theme.s(16),
  },
  row: {
    gap: theme.s(8),
    paddingHorizontal: theme.s(16),
  },
  add: {
    width: theme.s(84),
    height: theme.vs(112),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white12,
    backgroundColor: theme.colors.white3,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.vs(8),
  },
  plus: {
    width: theme.vs(34),
    height: theme.vs(34),
    borderRadius: theme.vs(17),
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    textAlign: "center",
    paddingHorizontal: theme.s(6),
  },
  story: {
    width: theme.s(84),
    height: theme.vs(112),
    borderRadius: theme.vs(18),
    overflow: "hidden",
    justifyContent: "space-between",
    padding: theme.s(8),
    backgroundColor: theme.colors.surface60,
  },
  shade: {
    ...StyleSheet.absoluteFillObject,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.ink0} 35%, ${theme.colors.ink90})`,
  },
  time: (live: boolean) => ({
    alignSelf: "flex-start",
    paddingVertical: theme.vs(3),
    paddingHorizontal: theme.s(7),
    borderRadius: theme.vs(999),
    backgroundColor: live ? theme.colors.red : theme.colors.ink40,
    borderWidth: live ? 0 : 1,
    borderColor: theme.colors.white20,
  }),
  storyTitle: {
    lineHeight: theme.vs(12 * 1.2),
    paddingBottom: theme.vs(1),
  },
}));
