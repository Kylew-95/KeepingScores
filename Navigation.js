import React from "react";
import { Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import Scores from "./screens/Scores";
import Profiles from "./screens/Profile";

const Tab = createBottomTabNavigator();
export default function Navigation() {
  return (
    <NavigationContainer>
      <TabGroup />
    </NavigationContainer>
  );
}
function TabGroup() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Find Your Match",
          headerStyle: {
            backgroundColor: "#2193F0",
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ size, focused }) => {
            const iconColor = focused ? "#2193F0" : "gray";
            return (
              <Image
                style={{ width: size, height: size, tintColor: iconColor }}
                source={require("./Images/locationIcon.png")}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Scores"
        component={Scores}
        options={{
          title: "Scores",
          headerStyle: {
            backgroundColor: "#2193F0",
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ size, focused }) => {
            const iconColor = focused ? "#2193F0" : "gray";
            return (
              <Image
                style={{ width: size, height: size, tintColor: iconColor }}
                source={require("./Images/score-boardicon.png")}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profiles}
        options={{
          title: "Profile",
          headerStyle: {
            height: 250,
          },
          headerTitle: () => (
            <Image
              style={{
                width: 400,
                height: 200,
                objectFit: "cover",
                justifyContent: "center",
                alignItems: "center",
              }}
              source={require("./Images/alicja-gancarz-wvDELsJ_E20-unsplash.jpg")}
            />
          ),
          tabBarIcon: ({ size, focused }) => {
            const iconColor = focused ? "#2193F0" : "gray";
            return (
              <Image
                style={{ width: size, height: size, tintColor: iconColor }}
                source={require("./Images/userIcon.png")}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}
