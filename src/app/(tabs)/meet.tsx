import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type {
  Connection,
  ConnectionFilterValues,
  ConnectionMode,
  ConnectionPreferencesFormValues,
} from "@/@types/connections";
import {
  ConnectionFilters,
  ConnectionPreferencesForm,
  DiscoverCard,
} from "@/components/meet";
import { ReportSheet } from "@/components/report";
import {
  useActOnCandidate,
  useConnectionPreferences,
  useDiscoverCards,
  useUpdateConnectionPreferences,
} from "@/hooks/useConnections";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIEmpty,
  UIFadeScrollView,
  UIFilters,
  UIGlass,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import {
  connectionFiltersSchema,
  connectionPreferencesSchema,
} from "@/schemas";
import {
  CONNECTION_MODES,
  DAILY_LIKE_LIMIT,
  INITIAL_CONNECTION_FILTERS,
  toCalendarDay,
  toDiscoverFilters,
  toPreferencesValues,
} from "@/utils";
import { apiErrorKey } from "@/utils/apiErrorKey";

export default function MeetScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ConnectionMode>("friends");
  // the match the last Connect made; its profile is revealed
  const [match, setMatch] = useState<Connection | null>(null);
  const reportRef = useRef<BottomSheetModal>(null);
  const filtersRef = useRef<BottomSheetModal>(null);
  // the sheet edits the form; the deck uses `filterValues`, copied across when the sheet closes
  const [filterValues, setFilterValues] = useState(INITIAL_CONNECTION_FILTERS);
  const { control, reset, handleSubmit } = useForm<ConnectionFilterValues>({
    resolver: zodResolver(connectionFiltersSchema),
    defaultValues: INITIAL_CONNECTION_FILTERS,
  });
  const filters = toDiscoverFilters(mode, filterValues);
  const { data: profile } = useMyProfile();
  const {
    data: deck,
    isPending,
    isError,
    refetch,
    isPlaceholderData,
  } = useDiscoverCards(filters);
  const { data: preferences } = useConnectionPreferences();
  const { dismiss } = useBottomSheetModal();
  const { mutateAsync: savePreferences, isPending: isSaving } =
    useUpdateConnectionPreferences();
  const { control: preferencesControl, handleSubmit: handlePreferencesSubmit } =
    useForm<ConnectionPreferencesFormValues>({
      resolver: zodResolver(connectionPreferencesSchema),
      values: toPreferencesValues(preferences),
    });
  const { mutateAsync: act, isPending: isActing } = useActOnCandidate(filters);
  const card = deck?.items?.[0];
  const openTo = preferences?.openTo ?? [];
  // the server only deals cards for a mode the student is open to
  const isClosedToMode = preferences !== undefined && !openTo.includes(mode);

  const showError = (error: unknown) =>
    toast.error(t(apiErrorKey(error), { limit: DAILY_LIKE_LIMIT }));

  const handleStudentsPress = () => router.push("/students");
  const handleFiltersOpen = () => reset(filterValues);
  const handleFiltersClose = handleSubmit((values) => {
    setFilterValues(values);
    setMatch(null);
  });
  // as on the web: saving the preferences opens the student to this mode, then the sheet closes and applies the filters
  const handleSavePress = handlePreferencesSubmit(
    async ({ birthDate, intent }) => {
      try {
        await savePreferences({
          ...(birthDate ? { birthDate: toCalendarDay(birthDate) } : {}),
          intent,
          openTo: openTo.includes(mode) ? openTo : [...openTo, mode],
        });
        toast.success(t("connections.preferencesSaved"));
        dismiss();
      } catch (error) {
        showError(error);
      }
    },
  );
  const handleProfilePress = () => router.push("/profile");
  const handleModePress = (value: ConnectionMode) => {
    setMode(value);
    setMatch(null);
  };
  const handleAction = async (action: "like" | "pass") => {
    if (!card) return;
    setMatch(null);
    try {
      const result = await act({ id: card.candidateId, mode, action });
      if (result.connection) setMatch(result.connection);
    } catch (error) {
      showError(error);
    }
  };
  const handlePassPress = () => handleAction("pass");
  const handleConnectPress = () => handleAction("like");
  const handleReportPress = () => reportRef.current?.present();
  const handleMatchPress = () => {
    if (match) router.push(`/student/${match.profile.id}`);
  };

  const emptyState = (
    <UIEmpty
      isScreenCentred
      message={t(
        isClosedToMode
          ? "connections.closedToMode"
          : "connections.emptyDescription",
      )}
    />
  );

  return (
    <UIPage>
      <View style={styles.page}>
        <View style={styles.header}>
          <UIText size="xl" weight="bold" style={styles.title}>
            {t("tabs.connections")}
          </UIText>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.searchStudents")}
            onPress={handleStudentsPress}
          >
            <Icon name="search" size={18} />
          </UIIconButton>
          <UIFilters
            ref={filtersRef}
            title={t("connections.filters")}
            onOpen={handleFiltersOpen}
            onClose={handleFiltersClose}
            action={{
              label: t("apiState.save"),
              isDisabled: isSaving,
              onPress: handleSavePress,
            }}
          >
            <ConnectionFilters control={control} mode={mode} />
            <ConnectionPreferencesForm control={preferencesControl} />
          </UIFilters>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("app.profile")}
            onPress={handleProfilePress}
          >
            <UIAvatar imageSrc={profile?.avatarUrl} />
          </Pressable>
        </View>
        <UIFadeScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modesScroll}
          contentContainerStyle={styles.modes}
        >
          {CONNECTION_MODES.map(([value, label, icon]) => {
            const selected = mode === value;
            const handleChipPress = () => handleModePress(value);
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={handleChipPress}
                style={styles.mode(selected)}
              >
                <Icon
                  name={icon}
                  size={14}
                  uniProps={(theme) => ({
                    color: selected ? theme.colors.ink : theme.colors.white,
                  })}
                />
                <UIText
                  size="sm"
                  weight="semibold"
                  color={selected ? "black" : "white"}
                >
                  {t(label)}
                </UIText>
              </Pressable>
            );
          })}
        </UIFadeScrollView>
        {isPending ? (
          <View style={styles.cardSkeleton}>
            <UISkeleton height="100%" />
          </View>
        ) : isError ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : card ? (
          <>
            <DiscoverCard card={card} onReportPress={handleReportPress} />
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.pass")}
                disabled={isActing || isPlaceholderData}
                onPress={handlePassPress}
                style={styles.action}
              >
                <UIGlass radius={32} style={styles.actionCircle}>
                  <Icon
                    name="x"
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.red })}
                  />
                </UIGlass>
                <UIText size="sm" color="soft">
                  {t("app.pass")}
                </UIText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.connect")}
                disabled={isActing || isPlaceholderData}
                onPress={handleConnectPress}
                style={styles.action}
              >
                <View style={[styles.actionCircle, styles.connect]}>
                  <Icon
                    name="heart"
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.ink })}
                  />
                </View>
                <UIText size="sm" color="soft">
                  {t("app.connect")}
                </UIText>
              </Pressable>
            </View>
          </>
        ) : null}
        {match ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleMatchPress}
            style={styles.notice}
          >
            <UIText color="success">{t("app.connected")}</UIText>
            <UIText weight="semibold" color="link">
              {t("connections.viewProfile")}
            </UIText>
          </Pressable>
        ) : null}
      </View>
      {/* a direct child of UIPage, so the cat centres like every other empty state */}
      {!isPending && !isError && !card ? emptyState : null}
      {card ? (
        <ReportSheet
          ref={reportRef}
          targetId={card.candidateId}
          targetType="candidate"
          onSent={refetch}
        />
      ) : null}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  page: {
    flex: 1,
    paddingTop: theme.vs(4),
    paddingHorizontal: theme.s(16),
    // the tab bar floats ~40pt above this page's bottom (UIPage pads the home indicator); +12 keeps the actions just above it, as in the design
    paddingBottom: theme.vs(52),
    gap: theme.vs(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  title: {
    flex: 1,
    lineHeight: theme.vs(30),
  },
  // edge to edge, so the pills scroll under the fades instead of being cut at the page inset
  modesScroll: {
    flexGrow: 0,
    marginHorizontal: -theme.s(16),
  },
  modes: {
    gap: theme.s(6),
    paddingHorizontal: theme.s(16),
  },
  mode: (selected: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(7),
    paddingHorizontal: theme.s(13),
    borderRadius: theme.vs(999),
    backgroundColor: selected ? theme.colors.white : theme.colors.white5,
    // a border on every chip (white when selected, like UIChip) so selecting one doesn't change its size
    borderWidth: 1,
    borderColor: selected ? theme.colors.white : theme.colors.white10,
  }),
  // fills the card's space while the deck loads
  cardSkeleton: { flex: 1 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(28),
  },
  action: {
    alignItems: "center",
    gap: theme.vs(8),
  },
  actionCircle: {
    width: theme.vs(64),
    height: theme.vs(64),
    borderRadius: theme.vs(32),
    alignItems: "center",
    justifyContent: "center",
  },
  connect: {
    backgroundColor: theme.colors.white,
  },
  notice: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.s(8),
  },
}));
