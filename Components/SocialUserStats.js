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
        <Text style={styles.labelColor}>MATCHES</Text>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.item}
        onPress={() => onPressFriends?.("followers")}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{followersCount}</Text>
        <Text style={styles.labelColor}>FOLLOWERS</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.item}
        onPress={() => onPressFriends?.("following")}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{followingCount}</Text>
        <Text style={styles.labelColor}>FOLLOWING</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },
  valueText: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  labelColor: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
