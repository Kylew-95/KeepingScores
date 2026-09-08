import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Card, List, Divider } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import ProfileChart from "./ProfileChart";
import { useNavigation } from "@react-navigation/native";

const data = [
  {
    id: 1,
    img: require("../Images/DashboardCardImgs/health.png"),
    title: "Exercise",
    description: "Stay active and explore new horizons.",
    screen: "Home",
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

export default function Dashboard() {
  const navigation = useNavigation();
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          onPress={() => {
            if (item.screen) {
              navigation.navigate(item.screen);
            }
          }}
        >
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
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.sectionHeading}>Start Your Journey</Text>
      <Card style={styles.healthCard}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 40,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
  },
  healthCard: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemContainer: {
    marginHorizontal: 12,
    marginBottom: 4,
  },
  itemImage: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "90%",
    marginVertical: 4,
    alignSelf: "center",
  },
});
