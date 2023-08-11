import { SafeAreaView, Text } from "react-native";
import React from "react";
import { TopNavScoreBar } from "../Navigation/TopNavScoreBar";

export default function Scores() {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <TopNavScoreBar />
    </SafeAreaView>
  );
}
