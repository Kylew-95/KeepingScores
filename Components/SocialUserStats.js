import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function SocialUserStats({
  matchesCount = 0,
  followersCount = 0,
  followingCount = 0,
  onPressFriends,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.valueText}>{matchesCount}</Text>
        <Text style={styles.labelColor}>Matches</Text>
      </View>

      <TouchableOpacity
        style={styles.item}
        onPress={onPressFriends}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{followersCount}</Text>
        <Text style={styles.labelColor}>Followers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={onPressFriends}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{followingCount}</Text>
        <Text style={styles.labelColor}>Following</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  labelColor: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
});
