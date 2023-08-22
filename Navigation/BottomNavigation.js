import React, { useState } from "react";
import { Image, Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Badge, Avatar, Drawer } from "react-native-paper";
import Home from "../screens/Home";
import Scores from "../screens/Scores";
import Profiles from "../screens/Profile";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
export default function BottomNavigation({
  users,
  setUsers,
  profileData,
  setProfileData,
  scoresData,
  setScoresData,
}) {
  return (
    <TabGroup
      users={users}
      setUsers={setUsers}
      profileData={profileData}
      setProfileData={setProfileData}
      scoresData={scoresData}
      setScoresData={setScoresData}
    />
  );
}
function TabGroup({
  users,
  setUsers,
  profileData,
  setProfileData,
  scoresData,
  setScoresData,
}) {
  const navigation = useNavigation();

  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          options={{
            headerShown: false,
            tabBarIcon: ({ size, focused }) => {
              const iconColor = focused ? "#2193F0" : "gray";
              return (
                <Image
                  style={{ width: size, height: size, tintColor: iconColor }}
                  source={require("../Images/compassicon.png")}
                />
              );
             
            },
            
          }}
        >
          {() => <Home profileData={profileData} />}
        </Tab.Screen>
        <Tab.Screen
          name="Scores"
          options={{
            title: "Keep Score",
            headerStyle: {
              backgroundColor: "#2193F0",
            },
            headerTintColor: "#fff",
            tabBarIcon: ({ size, focused }) => {
              const iconColor = focused ? "#2193F0" : "gray";
              return (
                <Image
                  style={{
                    width: size,
                    height: size,
                    tintColor: iconColor,
                    top: 2,
                  }}
                  source={require("../Images/score-boardicon.png")}
                />
              );
            },
          }}
        >
          {() => (
            <Scores
              users={users}
              scoresData={scoresData}
              setScoresData={setScoresData}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Profile"
          options={{
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ size, focused }) => {
              const iconColor = focused ? "#2193F0" : "gray";
              return (
                <>
                  <Badge
                    size={5}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 50,
                      backgroundColor: "#2193F0",
                    }}
                  ></Badge>

                  {/* Need to turn badge into a component so I can reuse it because ill need to use it on the live chat icon */}
                  <Avatar.Image
                    style={{
                      width: size,
                      height: size,
                      tintColor: iconColor,
                      zIndex: -1,
                      backgroundColor: "transparent",
                      top: 1,
                      right: 2,
                    }}
                    size={25}
                    source={{ uri: profileData?.avatar_image_url }}
                  />
                  {/* <Image
                  style={{ width: size, height: size, tintColor: iconColor }}
                  source={require("../Images/userIcon.png")}
                /> */}
                </>
              );
            },
          }}
        >
          {() => (
            <Profiles
              users={users}
              setUsers={setUsers}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}
