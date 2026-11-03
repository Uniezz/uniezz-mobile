import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import debounce from "lodash/debounce";
import { StyleSheet } from "react-native-unistyles";
import { useProfileSearch } from "@/hooks/useProfiles";
import { UIAvatar, UIGlass, UIQueryError, UISearch, UIText } from "@/ui";

export function StudentDirectory({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const updateQuery = useMemo(() => debounce(setQuery, 300), []);
  useEffect(() => () => updateQuery.cancel(), [updateQuery]);
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfileSearch(query);
  const students = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <UIText color="link">{t("app.back")}</UIText>
      </Pressable>
      <UIText size="lg" weight="semibold">
        {t("students.allStudents")}
      </UIText>
      <UISearch
        placeholder={t("students.search")}
        value={search}
        onChangeText={(value) => {
          setSearch(value);
          updateQuery(value);
        }}
      />
      {isPending ? (
        <UIText color="secondary">{t("apiState.loading")}</UIText>
      ) : isError ? (
        <UIQueryError message={t("apiState.error")} onRetry={refetch} />
      ) : students.length ? (
        students.map((student) => (
          <Pressable
            key={student.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/student/[id]",
                params: { id: student.id },
              })
            }
          >
            <UIGlass style={styles.row}>
              <UIAvatar imageSrc={student.avatarUrl ?? undefined} />
              <View style={styles.label}>
                <UIText weight="semibold">
                  {[student.firstName, student.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </UIText>
                <UIText size="sm" color="secondary">
                  {student.universityId.toUpperCase()}
                </UIText>
              </View>
              <UIText color="secondary">›</UIText>
            </UIGlass>
          </Pressable>
        ))
      ) : (
        <UIText color="secondary">{t("students.noResults")}</UIText>
      )}
      {hasNextPage ? (
        <Pressable
          accessibilityRole="button"
          disabled={isFetchingNextPage}
          onPress={() => fetchNextPage()}
        >
          <UIText color="link">
            {isFetchingNextPage
              ? t("apiState.loading")
              : t("apiState.loadMore")}
          </UIText>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.vs(14) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    padding: theme.s(12),
  },
  label: { flex: 1, gap: theme.vs(4) },
}));
