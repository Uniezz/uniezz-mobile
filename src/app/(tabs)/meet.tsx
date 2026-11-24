import {
  useBottomSheetModal,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import * as Haptics from "expo-haptics";
import type {
  ConnectionFilterValues,
  ConnectionMode,
  ConnectionPreferencesFormValues,
} from "@/@types";
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
} from "@/hooks";
import { ProfileButton } from "@/components/profile";
import {
  UIAvatar,
  UIPressable,
  Icon,
  UIEmpty,
  UIFilters,
  UIGlass,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UISubTabs,
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
  toDiscoverFilters,
  toPreferencesValues,
  apiErrorKey,
  authorName,
} from "@/utils";
import { useHapticsStore } from "@/store/hapticsStore";

export default function MeetScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ConnectionMode>("friends");
  const reportRef = useRef<BottomSheetModal>(null);
  const filtersRef = useRef<BottomSheetModal>(null);
  // the sheet edits the form; the deck uses `filterValues`, copied across when the sheet closes
  const [filterValues, setFilterValues] = useState(INITIAL_CONNECTION_FILTERS);
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty: isFiltersDirty },
  } = useForm<ConnectionFilterValues>({
    resolver: zodResolver(connectionFiltersSchema),
    defaultValues: INITIAL_CONNECTION_FILTERS,
  });
  const filters = toDiscoverFilters(mode, filterValues);
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
  const {
    control: preferencesControl,
    handleSubmit: handlePreferencesSubmit,
    formState: { isDirty: isPreferencesDirty },
  } = useForm<ConnectionPreferencesFormValues>({
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
  });
  // as on the web: saving the preferences opens the student to this mode, then the sheet closes and applies the filters
  const handleSavePress = handlePreferencesSubmit(async ({ intent }) => {
    try {
      await savePreferences({
        intent,
        openTo: openTo.includes(mode) ? openTo : [...openTo, mode],
      });
      toast.success(t("connections.preferencesSaved"));
      dismiss();
    } catch (error) {
      showError(error);
    }
  });
  const modeIndex = CONNECTION_MODES.findIndex(([value]) => value === mode);

  const handleModePress = (value: ConnectionMode) => {
    setMode(value);
  };
  const handleModeTabPress = (index: number) => {
    handleModePress(CONNECTION_MODES[index]?.[0] ?? "friends");
  };
  const handleAction = async (action: "like" | "pass") => {
    if (!card) return;
    try {
      const { connection } = await act({ id: card.candidateId, mode, action });
      if (!connection) return;
      const { profile } = connection;
      // the toast opens the chat tab, where the new match leads its row; a direct chat with someone
      // new has no id yet, and asking the API for one would hold the screen
      const handleOpenChats = () => router.navigate("/(tabs)/chat");
      toast.success(t("app.connected"), {
        description: authorName(profile) || t("apiState.student"),
        icon: <UIAvatar size="sm" imageSrc={profile.avatarUrl} />,
        action: { label: t("tabs.chat"), onClick: handleOpenChats },
        onPress: handleOpenChats,
        duration: 8000,
        styles: matchToastStyles,
      });
      if (useHapticsStore.getState().enabled) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    } catch (error) {
      showError(error);
    }
  };
  const handlePassPress = () => handleAction("pass");
  const handleConnectPress = () => handleAction("like");
  const handleReportPress = () => reportRef.current?.present();

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
          <UIText
            size="xl"
            weight="bold"
            numberOfLines={1}
            style={styles.title}
          >
            {t("connections.title")}
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
              // any change in the sheet enables it; Save also opens the student to this mode, so it stays enabled while they're closed to it
              isDisabled:
                isSaving ||
                (!isFiltersDirty && !isPreferencesDirty && !isClosedToMode),
              onPress: handleSavePress,
            }}
          >
            <ConnectionFilters control={control} mode={mode} />
            <ConnectionPreferencesForm control={preferencesControl} />
          </UIFilters>
          <ProfileButton />
        </View>
        <View style={styles.modeTabs}>
          <UISubTabs
            items={CONNECTION_MODES.map(([, label]) => t(label))}
            selectedItemIndex={modeIndex < 0 ? 0 : modeIndex}
            onPress={handleModeTabPress}
          />
        </View>
        {isPending ? (
          <View style={styles.cardSkeleton}>
            <UISkeleton height="100%" />
          </View>
        ) : isError ? (
          <UIQueryError message={t("apiState.error")} onRetry={refetch} />
        ) : card ? (
          <>
            <DiscoverCard
              // a new card starts at its first photo
              key={card.candidateId}
              card={card}
              onReportPress={handleReportPress}
            />
            <View style={styles.actions}>
              <UIPressable
                accessibilityRole="button"
                accessibilityLabel={t("app.pass")}
                disabled={isActing || isPlaceholderData}
                onPress={handlePassPress}
              >
                <UIGlass radius={32} style={styles.actionCircle}>
                  <Icon
                    name="x"
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.red })}
                  />
                </UIGlass>
              </UIPressable>
              <UIPressable
                accessibilityRole="button"
                accessibilityLabel={t("app.connect")}
                disabled={isActing || isPlaceholderData}
                onPress={handleConnectPress}
              >
                <View style={[styles.actionCircle, styles.connect]}>
                  <Icon
                    name="heart"
                    size={24}
                    uniProps={(theme) => ({ color: theme.colors.ink })}
                  />
                </View>
              </UIPressable>
            </View>
          </>
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
    // the tab bar floats above this page's bottom (UIPage pads the home indicator); +12 keeps the actions just above it.
    // iOS: the system bar reaches ~40pt; Android: GlassTabBar is 8 offset + 6 + 6 + 20 icon + 2 + ~14 label + 6 + 6 ≈ 68pt
    paddingBottom: theme.vs(Platform.OS === "android" ? 80 : 52),
    // 12pt below the title row matches UICollapsingHeader → UISubTabs on Study and FAQ
    gap: theme.vs(12),
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
  // cancel page inset so subtabs span the screen like on FAQ and Study
  modeTabs: {
    marginHorizontal: -theme.s(16),
  },
  // fills the card's space while the deck loads
  cardSkeleton: { flex: 1 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.s(28),
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
}));

// green like the success text it replaces, so a match reads apart from the plain white toasts
const matchToastStyles = StyleSheet.create((theme) => ({
  toast: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.green30,
    borderWidth: 1,
    borderRadius: theme.vs(16),
  },
  title: { color: theme.colors.green },
}));
