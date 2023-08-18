import React, { useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ConnectTab from "../screens/ProfileScreens/ConnectTab";
import { Image } from "react-native";
import ProfileDashBoard from "../screens/ProfileScreens/ProfileDashBoard";

const Tab = createMaterialTopTabNavigator();

export function TopProfileTabBar({ profileData, setProfileData }) {
  return <TabGroup profileData={profileData} setProfileData={setProfileData} />;
}

function TabGroup({ profileData, setProfileData }) {
  return (
    <Tab.Navigator>
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "white", height: 40 },
          tabBarInactiveTintColor: "grey",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../Images/dashboardicon.png")}
              style={{
                tintColor: focused ? "black" : "grey",
                width: 14,
                height: 14,
              }}
            />
          ),
        }}
        name="DashBoard"
      >
        {() => (
          <ProfileDashBoard
            setProfileData={setProfileData}
            profileData={profileData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        options={{
          tabBarStyle: { backgroundColor: "white", height: 40 },
          tabBarInactiveTintColor: "black",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../Images/molecularicon.png")}
              style={{
                tintColor: focused ? "black" : "grey",
                width: 14,
                height: 14,
              }}
            />
          ),
        }}
        name="Connect"
      >
        {() => (
          <ConnectTab
            setProfileData={setProfileData}
            profileData={profileData}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
