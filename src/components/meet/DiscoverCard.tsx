import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { DiscoverCard as DiscoverCardData } from "@/@types";
import { InterestChips } from "@/components/profile";
import {
  Icon,
  UIFadeScrollView,
  UIIconButton,
  UIImage,
  UIPressable,
  UIText,
} from "@/ui";
import { STUDY_LEVELS, UNIVERSITY_SHORT_NAMES } from "@/utils";

type DiscoverCardProps = {
  card: DiscoverCardData;
  onReportPress: () => void;
};

// who the student is, as on Tinder: the photos on top, avatar first, a tap on the left or right
// half flips back or forward; first name and facts over the photo
export function DiscoverCard({ card, onReportPress }: DiscoverCardProps) {
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const level = STUDY_LEVELS.find(([value]) => value === card.level)?.[1];
  const facts = [
    card.age === null ? null : String(card.age),
    level ? t(level) : null,
    UNIVERSITY_SHORT_NAMES[card.universityId] ?? card.universityId,
  ].filter(Boolean);
  const photos = card.photos ?? [];

  const handlePreviousPress = () => setPhotoIndex((i) => Math.max(i - 1, 0));
  const handleNextPress = () =>
    setPhotoIndex((i) => Math.min(i + 1, photos.length - 1));

  const header = (
    <View style={styles.top}>
      {/* lets a tap on the name over the photo still flip it */}
      <View style={styles.facts} pointerEvents="none">
        <UIText size="lg" weight="bold" numberOfLines={1}>
          {card.student.firstName ?? t("apiState.student")}
        </UIText>
        <UIText size="body" weight="medium" color="soft">
          {facts.join(" · ")}
        </UIText>
      </View>
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("report.candidate")}
        onPress={onReportPress}
      >
        <Icon name="flag" size={18} />
      </UIIconButton>
    </View>
  );

  return (
    <View style={styles.card}>
      {photos.length ? (
        <View style={styles.photo}>
          {/* all stacked, only the current one shown, so a flip doesn't wait for a download */}
          {photos.map((url, index) => (
            <UIImage
              key={url}
              source={{ uri: url }}
              fallback={undefined}
              contentFit="cover"
              style={[
                StyleSheet.absoluteFill,
                styles.image(index === photoIndex),
              ]}
            />
          ))}
          <View style={styles.halves}>
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={t("postComposer.previousPhoto")}
              onPress={handlePreviousPress}
              style={styles.half}
            />
            <UIPressable
              accessibilityRole="button"
              accessibilityLabel={t("postComposer.nextPhoto")}
              onPress={handleNextPress}
              style={styles.half}
            />
          </View>
          {photos.length > 1 ? (
            <View style={styles.bars} pointerEvents="none">
              {photos.map((url, index) => (
                <View key={url} style={styles.bar(index === photoIndex)} />
              ))}
            </View>
          ) : null}
          <View style={styles.overlay} pointerEvents="box-none">
            {header}
          </View>
        </View>
      ) : (
        <View style={styles.plainTop}>{header}</View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={photos.length ? styles.detailsUnderPhoto : styles.details}
        contentContainerStyle={styles.content}
      >
        {card.intent ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="link">
              {t("connections.lookingFor")}
            </UIText>
            <UIText size="lg" weight="bold">
              {card.intent}
            </UIText>
          </View>
        ) : null}
        {card.bio ? (
          <UIText size="rg" color="soft" style={styles.bio}>
            {card.bio}
          </UIText>
        ) : null}
        {card.sharedInterests?.length ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="link">
              {t("connections.inCommon")}
            </UIText>
            <UIFadeScrollView
              horizontal
              fadeColor="surface"
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chips}
            >
              <InterestChips interests={card.sharedInterests} />
            </UIFadeScrollView>
          </View>
        ) : null}
        {card.interests?.length ? (
          <View style={styles.section}>
            <UIText size="xs" weight="semibold" color="secondary">
              {t("connections.interests")}
            </UIText>
            <UIFadeScrollView
              horizontal
              fadeColor="surface"
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chips}
            >
              <InterestChips interests={card.interests} />
            </UIFadeScrollView>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    // fills the space between the modes and the actions, so the screen fits without scrolling
    flex: 1,
    borderRadius: theme.vs(16),
    borderWidth: 1,
    borderColor: theme.colors.white10,
    backgroundColor: theme.colors.surface60,
    // the photo runs to the card's rounded edge
    overflow: "hidden",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  facts: { flex: 1, gap: theme.vs(2) },
  photo: { flex: 1, backgroundColor: theme.colors.surface },
  image: (isCurrent: boolean) => ({ opacity: isCurrent ? 1 : 0 }),
  halves: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  half: { flex: 1 },
  bars: {
    position: "absolute",
    top: theme.vs(8),
    left: theme.s(10),
    right: theme.s(10),
    flexDirection: "row",
    gap: theme.s(4),
  },
  bar: (isCurrent: boolean) => ({
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: isCurrent ? theme.colors.white : theme.colors.white40,
  }),
  // darkens the photo's bottom so the name reads on any picture
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.s(14),
    paddingTop: theme.vs(40),
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.ink0}, ${theme.colors.ink70})`,
  },
  plainTop: { padding: theme.s(14), paddingBottom: 0 },
  details: { flex: 1 },
  // the photo keeps most of the card; the details scroll in what's left
  detailsUnderPhoto: { flexGrow: 0, maxHeight: "40%" },
  content: { gap: theme.vs(16), padding: theme.s(14) },
  section: { gap: theme.vs(6) },
  // one row that scrolls sideways, edge to edge in the card so chips slide under the fades
  chipsScroll: { marginHorizontal: -theme.s(14) },
  chips: { paddingHorizontal: theme.s(14) },
  bio: { lineHeight: theme.vs(24) },
}));
