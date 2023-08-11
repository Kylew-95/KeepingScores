import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ScoresTab from "../screens/ScoreScreens/ScoresTab";
import AddScoresTab from "../screens/ScoreScreens/AddScoresTab";

const Tab = createMaterialTopTabNavigator();

export function TopNavScoreBar() {
  return <TabGroup />;
}

function TabGroup() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="My Scores" component={ScoresTab} />
      <Tab.Screen name="Add Scores" component={AddScoresTab} />
    </Tab.Navigator>
  );
}
