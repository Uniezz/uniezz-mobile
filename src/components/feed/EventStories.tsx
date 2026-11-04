import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { ApiFeedPost } from "@/@types/feed";
import { Icon, UIImage, UIText } from "@/ui";
import { isLive } from "@/utils";

const Shade = withUnistyles(Stop, (theme) => ({ stopColor: theme.colors.ink }));

type EventStoriesProps = {
  events: ApiFeedPost[];
};

export const EventStories = ({ events }: EventStoriesProps) => {
  const { t, i18n } = useTranslation();
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "en", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
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
        <UIText size="xs" weight="semibold">
          {t("feed.addEvent")}
        </UIText>
      </Pressable>
      {events.map((event) => {
        const live = isLive(event.eventDate);
        return (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            accessibilityLabel={event.title}
            onPress={() =>
              router.push({
                pathname: "/feed/post/[id]",
                params: { id: event.id },
              })
            }
            style={styles.story}
          >
            <UIImage
              source={{ uri: event.mediaUrls?.[0] }}
              fallback={undefined}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                  <Shade offset="0.35" stopOpacity={0} />
                  <Shade offset="1" stopOpacity={0.9} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#shade)" />
            </Svg>
            <View style={styles.time(live)}>
              <UIText size="xs" weight="semibold">
                {live
                  ? t("app.liveNow")
                  : event.eventDate
                    ? time.format(new Date(event.eventDate))
                    : ""}
              </UIText>
            </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.s(10),
  },
  add: {
    width: theme.s(96),
    height: theme.vs(136),
    borderRadius: theme.vs(18),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
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
  story: {
    width: theme.s(96),
    height: theme.vs(136),
    borderRadius: theme.vs(18),
    overflow: "hidden",
    justifyContent: "space-between",
    padding: theme.s(8),
    backgroundColor: theme.colors.surface60,
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
