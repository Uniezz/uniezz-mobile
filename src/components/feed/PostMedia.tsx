import { useState } from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIImage } from "@/ui";

type PostMediaProps = {
  urls: string[];
};

export const PostMedia = ({ urls }: PostMediaProps) => {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width) setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {urls.map((url) => (
          <UIImage
            key={url}
            source={{ uri: url }}
            fallback={undefined}
            contentFit="cover"
            style={styles.image(width)}
          />
        ))}
      </ScrollView>
      {urls.length > 1 ? (
        <View style={styles.dots}>
          {urls.map((url, index) => (
            <View key={url} style={styles.dot(index === page)} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    height: theme.vs(190),
    borderRadius: theme.vs(16),
    overflow: "hidden",
    backgroundColor: theme.colors.surface60,
  },
  image: (width: number) => ({
    width,
    height: "100%",
  }),
  dots: {
    position: "absolute",
    bottom: theme.vs(10),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
    paddingVertical: theme.vs(5),
    paddingHorizontal: theme.s(8),
    borderRadius: theme.vs(999),
    backgroundColor: theme.colors.ink40,
  },
  dot: (active: boolean) => ({
    width: theme.vs(6),
    height: theme.vs(6),
    borderRadius: theme.vs(3),
    backgroundColor: active ? theme.colors.white : theme.colors.white40,
  }),
}));
