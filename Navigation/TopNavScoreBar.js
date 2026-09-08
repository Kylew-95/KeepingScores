import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ScoresTab from "../screens/ScoreScreens/ScoresTab";
import AddScoresTab from "../screens/ScoreScreens/AddScoresTab";
import LeaderboardTab from "../screens/ScoreScreens/LeaderboardTab";
import AddSteps from "../screens/ScoreScreens/AddSteps";

const Tab = createMaterialTopTabNavigator();

export function TopNavScoreBar({
  userId,
  profileData,
  scoresData,
  setScoresData,
}) {
  return (
    <TabGroup
      scoresData={scoresData}
      setScoresData={setScoresData}
      userId={userId}
      profileData={profileData}
    />
  );
}

function TabGroup({ userId, profileData, scoresData, setScoresData }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2193F0",
        tabBarInactiveTintColor: "#64748B",
        tabBarIndicatorStyle: { backgroundColor: "#2193F0" },
        tabBarLabelStyle: {
          fontWeight: "700",
          textTransform: "capitalize",
          fontSize: 13,
        },
      }}
    >
      <Tab.Screen name="Leaderboard">{() => <LeaderboardTab />}</Tab.Screen>
      <Tab.Screen name="Add Scores">
        {() => (
          <AddScoresTab
            scoresData={scoresData}
            setScoresData={setScoresData}
            userId={userId}
            profileData={profileData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="My Scores">
        {() => (
          <ScoresTab scoresData={scoresData} setScoresData={setScoresData} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
