import { useActionState, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SubmitState = {
  error?: string;
  greeting?: string;
};

/**
 * useActionState manages the pending / error / result lifecycle of an async
 * action for you. On the web you'd pass it to a <form action={...}>; in React
 * Native there are no DOM forms, so you call the returned action directly with a
 * payload. The signature is (previousState, payload) => nextState.
 */
async function submitAction(
  _prev: SubmitState,
  name: string,
): Promise<SubmitState> {
  await new Promise((r) => setTimeout(r, 800));
  if (!name.trim()) {
    return { error: "Please enter a name" };
  }
  return { greeting: `Hello, ${name.trim()}!` };
}

export function ActionStateExample() {
  const [state, submit, isPending] = useActionState(submitAction, {});
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        editable={!isPending}
      />
      <TouchableOpacity
        style={styles.button}
        disabled={isPending}
        onPress={() => submit(name)}
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
      {state.error ? <Text style={styles.error}>{state.error}</Text> : null}
      {state.greeting ? (
        <Text style={styles.greeting}>{state.greeting}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.4)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
  error: { color: "#dc2626" },
  greeting: { fontWeight: "600" },
});
