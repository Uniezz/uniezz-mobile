import { Activity, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * <Activity> lets you keep part of the tree mounted but hidden. A "hidden"
 * Activity preserves its state and effects are paused, so switching back is
 * instant and React can pre-render hidden content at lower priority — ideal for
 * tab-like UIs where you don't want to lose scroll position / form input.
 */
function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{label}</Text>
      <TouchableOpacity onPress={() => setCount((c) => c + 1)}>
        <Text style={styles.count}>Tapped {count} times</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        Switch tabs and back — the count is preserved because the hidden tab
        stays mounted inside &lt;Activity&gt;.
      </Text>
    </View>
  );
}

export function ActivityExample() {
  const [tab, setTab] = useState<"a" | "b">("a");

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab("a")}>
          <Text style={[styles.tab, tab === "a" && styles.tabActive]}>
            Tab A
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("b")}>
          <Text style={[styles.tab, tab === "b" && styles.tabActive]}>
            Tab B
          </Text>
        </TouchableOpacity>
      </View>

      <Activity mode={tab === "a" ? "visible" : "hidden"}>
        <Counter label="Tab A content" />
      </Activity>
      <Activity mode={tab === "b" ? "visible" : "hidden"}>
        <Counter label="Tab B content" />
      </Activity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  tabs: { flexDirection: "row", gap: 16 },
  tab: { fontSize: 16, opacity: 0.5 },
  tabActive: { opacity: 1, fontWeight: "700" },
  panel: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(127,127,127,0.1)",
    gap: 6,
  },
  panelTitle: { fontWeight: "600" },
  count: { fontSize: 18 },
  hint: { fontSize: 12, opacity: 0.6 },
});
