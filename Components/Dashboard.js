import { View, Text, SafeAreaView, Image, StyleSheet } from "react-native";
import React from "react";
import { Card, List, Divider } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";

const data = [
  {
    id: 1,
    img: require("../Images/DashboardCardImgs/health.png"),
    title: "Exercise",
    description: "Stay active with tailored workouts.",
  },
  {
    id: 2,
    img: require("../Images/DashboardCardImgs/measuring.png"),
    title: "Measurements",
    description: "Track your progress and goals.",
  },
  {
    id: 3,
    img: require("../Images/DashboardCardImgs/insomnia.png"),
    title: "Sleep",
    description: "Improve sleep quality with insights.",
  },
];

const renderItem = ({ item }) => {
  return (
    <View style={styles.itemContainer}>
      <List.Section>
        <List.Item
          title={item.title}
          left={() => <Image source={item.img} style={styles.itemImage} />}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <List.Subheader style={{ marginTop: -30, left: 40 }}>
          {item.description}
        </List.Subheader>
      </List.Section>
      <Divider style={styles.divider} />
    </View>
  );
};
export default function Dashboard() {
  return (
    <SafeAreaView style={{ height: "100%" }}>
      <Card
        style={{
          width: "80%",
          height: 90,
          alignSelf: "center",
          top: -40,
          zIndex: 20,
          backgroundColor: "white",
        }}
      >
        <Card.Title title="Card Title" subtitle="Card Subtitle" />
      </Card>
      <Card
        style={{
          width: "80%",
          height: 130,
          alignSelf: "center",
          top: -40,
          marginTop: 25,
          backgroundColor: "white",
        }}
      >
        <Card.Title title="Card Title" subtitle="Card Subtitle 2" />
      </Card>
      <Text
        style={{
          left: 40,
          top: -30,
          marginTop: 20,
          fontSize: 22,
          fontWeight: 500,
        }}
      >
        Start Your Journey
      </Text>
      <Card
        style={{
          width: "80%",
          height: 300,
          alignSelf: "center",
          top: -40,
          marginTop: 20,
          marginBottom: 70,
          backgroundColor: "white",
        }}
      >
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: 20,
    marginVertical: -50,
    top: 50,
    marginBottom: 10,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#B9B9B97D",
    width: "60%",
    marginVertical: 2,
    marginBottom: 15,
    alignSelf: "center",
    top: -4,
  },
});
