import { useEffect, useEffectEvent, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

// Stand-in for a real connection (websocket, BLE, subscription, ...).
function connect(_roomId: string) {
  let timer: ReturnType<typeof setTimeout>;
  return {
    on(_event: "connected", cb: () => void) {
      timer = setTimeout(cb, 300);
    },
    disconnect() {
      clearTimeout(timer);
    },
  };
}

/**
 * useEffectEvent lets an Effect read the latest props/state WITHOUT listing them
 * as dependencies — so the effect doesn't re-run (reconnect) just because an
 * unrelated value changed.
 *
 * Here the effect reconnects only when `roomId` changes, but the "connected"
 * handler always sees the current `muted` value via the Effect Event.
 */
export function EffectEventExample({
  roomId = "general",
}: {
  roomId?: string;
}) {
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("connecting...");

  const onConnected = useEffectEvent(() => {
    // Reads the latest `muted` even though it is not an effect dependency.
    setStatus(muted ? "connected (muted)" : "connected 🔔");
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on("connected", () => onConnected());
    return () => connection.disconnect();
    // Only roomId drives reconnection. Effect Events (onConnected) are stable and
    // must NOT be listed as dependencies — that is the whole point of the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Room &quot;{roomId}&quot;: {status}
      </Text>
      <View style={styles.row}>
        <Text>Muted</Text>
        <Switch value={muted} onValueChange={setMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  status: { fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
