import { LegendList } from "@legendapp/list/react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIAvatar, UIChip, UIGlass, UIPage, UIText } from "@/ui";

const places = [
  {
    name: "Biedronka",
    address: "ul. Radziszewskiego 8",
    distance: "4 min walk",
    x: "18%",
    y: "26%",
  },
  {
    name: "Lidl",
    address: "al. Kraśnicka 31",
    distance: "9 min by bus",
    x: "60%",
    y: "18%",
  },
  {
    name: "Carrefour Express",
    address: "ul. Głęboka 12",
    distance: "2 min walk",
    x: "7%",
    y: "48%",
  },
  {
    name: "Stokrotka",
    address: "ul. Sowińskiego 4",
    distance: "6 min walk",
    x: "53%",
    y: "42%",
  },
];

export default function GuideScreen() {
  const [category, setCategory] = useState("Groceries");
  const [selected, setSelected] = useState(0);
  return (
    <UIPage>
      <ImageBackground
        source={require("../../../assets/guide-map.png")}
        resizeMode="cover"
        style={styles.map}
      >
        <View style={styles.top}>
          <View style={styles.header}>
            <UIText size="xl" weight="bold" style={styles.title}>
              Guide
            </UIText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push("/profile")}
            >
              <UIAvatar imageSrc={require("../../../assets/profile-cat.png")} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {["Groceries", "Hangouts", "Dorms", "Night"].map((item) => (
              <UIChip
                key={item}
                label={item}
                selected={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </ScrollView>
        </View>
        {category === "Groceries" &&
          places.map((place, index) => (
            <Pressable
              key={place.name}
              accessibilityRole="button"
              accessibilityLabel={place.name}
              onPress={() => setSelected(index)}
              style={[
                styles.pin,
                { left: place.x as `${number}%`, top: place.y as `${number}%` },
                selected === index && styles.pinSelected,
              ]}
            >
              <UIText
                size="xs"
                weight="semibold"
                color={selected === index ? "black" : "white"}
              >
                {place.name}
              </UIText>
            </Pressable>
          ))}
        <UIGlass style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <UIText size="md" weight="semibold">
              {category === "Groceries"
                ? "Cheap groceries near campus"
                : category}
            </UIText>
            <UIText size="sm" color="secondary">
              {category === "Groceries" ? "18" : "0"}
            </UIText>
          </View>
          <LegendList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={category === "Groceries" ? places : []}
            keyExtractor={(place) => place.name}
            extraData={selected}
            ListEmptyComponent={
              <UIText color="secondary">No places in this category yet.</UIText>
            }
            renderItem={({ item: place, index }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelected(index)}
                style={[styles.row, selected === index && styles.rowSelected]}
              >
                <View style={styles.placeIcon}>
                  <UIText size="md">⌂</UIText>
                </View>
                <View style={styles.placeText}>
                  <UIText weight="semibold">{place.name}</UIText>
                  <UIText size="sm" color="secondary">
                    {place.address} · {place.distance}
                  </UIText>
                </View>
                <UIText color="secondary">›</UIText>
              </Pressable>
            )}
          />
        </UIGlass>
      </ImageBackground>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  map: { flex: 1, justifyContent: "space-between" },
  top: {
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    gap: theme.vs(14),
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1 },
  categories: { gap: theme.s(6) },
  pin: {
    position: "absolute",
    paddingHorizontal: theme.s(8),
    paddingVertical: theme.vs(6),
    backgroundColor: theme.colors.ink90,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.white20,
  },
  pinSelected: { backgroundColor: theme.colors.white },
  sheet: {
    height: "42%",
    marginHorizontal: theme.s(8),
    marginBottom: theme.vs(75),
    padding: theme.s(14),
    gap: theme.vs(10),
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.white20,
    alignSelf: "center",
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between" },
  list: { flex: 1 },
  listContent: { gap: theme.vs(4) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    minHeight: theme.vs(64),
    padding: theme.s(8),
    borderRadius: theme.vs(16),
  },
  rowSelected: { backgroundColor: theme.colors.white10 },
  placeIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.blue20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeText: { flex: 1, gap: theme.vs(3) },
}));
