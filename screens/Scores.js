import { SafeAreaView, Text } from "react-native";
import React from "react";
import { TopNavScoreBar } from "../Navigation/TopNavScoreBar";

export default function Scores({ userId }) {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <TopNavScoreBar userId={userId} />
    </SafeAreaView>
  );
}
