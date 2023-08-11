import React from "react";
import { Image, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Badge, Avatar } from "react-native-paper";
import Home from "../screens/Home";
import Scores from "../screens/Scores";
import Profiles from "../screens/Profile";

const Tab = createBottomTabNavigator();
export default function BottomNavigation() {
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
                source={require("../Images/locationIcon.png")}
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
                source={require("../Images/score-boardicon.png")}
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
            height: 240,
          },
          headerTitle: (props) => (
            <>
              <Text
                style={{
                  fontSize: 40,
                  color: "white",
                  marginTop: 120,
                  textAlign: "center",
                  flex: 1,
                  justifyContent: "center",
                  marginLeft: 100,
                }}
              >
                Hello User
              </Text>
              <Image
                style={{
                  position: "absolute",
                  resizeMode: "cover",
                  width: 500,
                  height: 250,
                  top: -50,
                  marginLeft: -20,
                  zIndex: -1,
                }}
                source={require("../Images/alicja-gancarz-wvDELsJ_E20-unsplash.jpg")}
              />
            </>
          ),
          tabBarIcon: ({ size, focused }) => {
            const iconColor = focused ? "#2193F0" : "gray";
            return (
              <>
                <Badge
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 42,
                    backgroundColor: "#2193F0",
                  }}
                >
                  3
                </Badge>
                <Avatar.Image
                  style={{
                    width: size,
                    height: size,
                    tintColor: iconColor,
                    zIndex: -1,
                  }}
                  size={24}
                  source={require("../Images/batmanAvatar.png")}
                />
                {/* <Image
                  style={{ width: size, height: size, tintColor: iconColor }}
                  source={require("../Images/userIcon.png")}
                /> */}
              </>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}
