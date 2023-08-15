import React from "react";
import { Image, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Badge, Avatar } from "react-native-paper";
import Home from "../screens/Home";
import Scores from "../screens/Scores";
import Profiles from "../screens/Profile";

const Tab = createBottomTabNavigator();
export default function BottomNavigation({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  return (
    <TabGroup
      users={users}
      setUsers={setUsers}
      profileData={profileData}
      setProfileData={setProfileData}
    />
  );
}
function TabGroup({ users, setUsers, profileData, setProfileData }) {
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
        {() => <Scores users={users} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerStyle: {
            height: 240,
          },
          headerTitle: () => (
            // Remove the profileData parameter
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
                Hello {!profileData && profileData.first_name ? "User": profileData.first_name }
              </Text>
              <>
                <Image
                  style={{
                    position: "absolute",
                    resizeMode: "cover",
                    width: 500,
                    height: 250,
                    top: -50,
                    marginLeft: -20,
                    zIndex: -10,
                    backgroundColor: "transparent",
                  }}
                  source={require("../Images/alicja-gancarz-wvDELsJ_E20-unsplash.jpg")}
                ></Image>
                <Avatar.Image
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: 10,
                    left: 350,
                    color: "white",
                    backgroundColor: "transparent",
                  }}
                  size={35}
                  source={require("../Images/burgermenu.png")}
                />
                <Image
                  style={{
                    position: "absolute",
                    height: 40,
                    width: 40,
                    zIndex: 11,
                    top: 10,
                    left: -2,
                    backgroundColor: "transparent",
                  }}
                  source={require("../Images/comment-chat-icon.png")}
                />
              </>
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
                  4
                </Badge>
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
                  size={30}
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
  );
}
