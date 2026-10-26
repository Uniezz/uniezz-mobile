import { MeshGradientView } from "expo-mesh-gradient";
import { StyleSheet } from "react-native-unistyles";
import { BACKDROPS, BackdropVariant, gridPoints } from "@/utils";

export type UIBackdropVariant = BackdropVariant;

type UIBackdropProps = {
  variant: UIBackdropVariant;
};

export const UIBackdrop = ({ variant }: UIBackdropProps) => {
  const { columns, rows, colors } = BACKDROPS[variant];
  return (
    <MeshGradientView
      style={styles.mesh}
      pointerEvents="none"
      columns={columns}
      rows={rows}
      colors={colors}
      points={gridPoints(columns, rows)}
    />
  );
};

const styles = StyleSheet.create({
  mesh: StyleSheet.absoluteFillObject,
});
