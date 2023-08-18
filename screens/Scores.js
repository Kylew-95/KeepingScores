import { SafeAreaView, Text } from "react-native";
import React from "react";
import { TopNavScoreBar } from "../Navigation/TopNavScoreBar";

export default function Scores({ userId, scoresData, setScoresData }) {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <TopNavScoreBar
        userId={userId}
        scoresData={scoresData}
        setScoresData={setScoresData}
      />
    </SafeAreaView>
  );
}
