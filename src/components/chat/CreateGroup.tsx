import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIAvatar, UIInput, UIText } from "@/ui";
import type { CreateGroupFormValues } from "@/@types/chat";
import { createGroupSchema } from "@/schemas";
import { useTranslation } from "react-i18next";

const suggestions = ["Kateryna Melnyk", "Taras Hnatiuk", "Anna Nowak"];

export function CreateGroup({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (name: string, members: string[]) => void;
}) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { groupName: "", members: [] },
    mode: "onChange",
  });
  const onSubmit = handleSubmit(({ groupName, members }) =>
    onCreate(groupName, members),
  );
  return (
    <>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <UIText color="link">‹ Back to chat</UIText>
      </Pressable>
      <UIText size="lg" weight="bold">
        New group
      </UIText>
      <Controller
        control={control}
        name="groupName"
        render={({ field, fieldState }) => (
          <UIInput
            captionText="Group name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={fieldState.error?.message && t(fieldState.error.message)}
            maxLength={80}
          />
        )}
      />
      <UIText color="secondary">Add people</UIText>
      <Controller
        control={control}
        name="members"
        render={({ field }) => (
          <>
            {suggestions.map((name) => (
              <Pressable
                key={name}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: field.value.includes(name) }}
                style={styles.row}
                onPress={() =>
                  field.onChange(
                    field.value.includes(name)
                      ? field.value.filter((item) => item !== name)
                      : [...field.value, name],
                  )
                }
              >
                <UIAvatar />
                <UIText style={styles.name}>{name}</UIText>
                <UIText color="link">
                  {field.value.includes(name) ? "✓" : "+"}
                </UIText>
              </Pressable>
            ))}
          </>
        )}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!isValid}
        onPress={() => onSubmit()}
      >
        <UIText color="link" weight="bold">
          Create group
        </UIText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.vs(72),
    gap: theme.s(12),
    paddingHorizontal: theme.s(8),
  },
  name: { flex: 1 },
}));
