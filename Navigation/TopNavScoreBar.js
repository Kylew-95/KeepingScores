import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ScoresTab from "../screens/ScoreScreens/ScoresTab";
import AddScoresTab from "../screens/ScoreScreens/AddScoresTab";

const Tab = createMaterialTopTabNavigator();

export function TopNavScoreBar({ userId }) {
  return <TabGroup />;
}

function TabGroup({ userId }) {
  const [scoresData, setScoresData] = useState([]);

  return (
    <Tab.Navigator>
      <Tab.Screen
        options={{ tabBarInactiveTintColor: "grey" }}
        name="My Scores"
      >
        {() => (
          <ScoresTab scoresData={scoresData} setScoresData={setScoresData} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Add Scores">
        {() => (
          <AddScoresTab
            scoresData={scoresData}
            setScoresData={setScoresData}
            userId={userId}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
