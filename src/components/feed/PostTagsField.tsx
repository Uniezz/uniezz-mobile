import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Icon, UIText } from "@/ui";
import { PostTag } from "./PostTag";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

type PostTagsFieldProps = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export const PostTagsField = ({ value, onChange }: PostTagsFieldProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const tag = draft.trim().replace(/^#/, "");
  const canAdd =
    tag.length > 0 &&
    value.length < MAX_TAGS &&
    !value.some((item) => item.toLowerCase() === tag.toLowerCase());

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (removed: string) =>
    onChange(value.filter((item) => item !== removed));

  return (
    <View style={styles.field}>
      <View style={styles.top}>
        <UIText size="sm" weight="semibold" color="soft">
          {t("postComposer.tags")}
        </UIText>
        <UIText size="xs" color="secondary">
          {t("postComposer.tagsHint", { used: value.length })}
        </UIText>
      </View>
      <View style={styles.inputRow}>
        <ThemedTextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleAdd}
          placeholder={t("postComposer.tagsPlaceholder")}
          maxLength={MAX_TAG_LENGTH}
          autoCapitalize="none"
          returnKeyType="done"
          submitBehavior="submit"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("postComposer.addTag")}
          disabled={!canAdd}
          onPress={handleAdd}
          style={styles.add(canAdd)}
        >
          <Icon
            name="plus"
            size={18}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
        </Pressable>
      </View>
      {value.length ? (
        <View style={styles.tags}>
          {value.map((item) => (
            <PostTag
              key={item}
              tag={item}
              removeLabel={`${t("app.remove")} #${item}`}
              onRemove={() => removeTag(item)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.vs(8),
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.s(4),
  },
  inputRow: {
    flexDirection: "row",
    gap: theme.s(8),
  },
  input: {
    flex: 1,
    height: theme.vs(48),
    borderRadius: theme.vs(12),
    borderWidth: 1,
    borderColor: theme.colors.white12,
    backgroundColor: theme.colors.white3,
    paddingHorizontal: theme.s(16),
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(16),
  },
  add: (enabled: boolean) => ({
    width: theme.vs(48),
    height: theme.vs(48),
    borderRadius: theme.vs(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: enabled ? theme.colors.white : theme.colors.white40,
  }),
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.s(6),
  },
}));
