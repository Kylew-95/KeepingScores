import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";

export default function SocialUserStats() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.item}>
        <View style={styles.valueContainer}>
          <Text style={styles.text}>5</Text>
        </View>
        <Text style={styles.text}>Posts</Text>
      </View>
      <View style={styles.item}>
        <View style={styles.valueContainer}>
          <Text style={styles.text}>1.2M</Text>
        </View>
        <Text style={styles.text}>Followers</Text>
      </View>
      <View style={styles.item}>
        <View style={styles.valueContainer}>
          <Text style={styles.text}>456</Text>
        </View>
        <Text style={styles.text}>Following</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    textAlign: "center",
  },
  item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  valueContainer: {
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 5,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
