import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ScoresTab from "../screens/ScoreScreens/ScoresTab";
import AddScoresTab from "../screens/ScoreScreens/AddScoresTab";
import AddSteps from "../screens/ScoreScreens/AddSteps";

const Tab = createMaterialTopTabNavigator();

export function TopNavScoreBar({ userId, scoresData, setScoresData }) {
  return (
    <TabGroup
      scoresData={scoresData}
      setScoresData={setScoresData}
      userId={userId}
    />
  );
}

function TabGroup({ userId, scoresData, setScoresData }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Add Scores">
        {() => (
          <AddScoresTab
            scoresData={scoresData}
            setScoresData={setScoresData}
            userId={userId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        options={{ tabBarInactiveTintColor: "grey" }}
        name="My Scores"
      >
        {() => (
          <ScoresTab scoresData={scoresData} setScoresData={setScoresData} />
        )}
      </Tab.Screen>
      <Tab.Screen
        options={{ tabBarInactiveTintColor: "grey" }}
        name="Step Counter"
      >
        {() => <AddSteps />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
