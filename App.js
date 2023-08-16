import React, { useEffect, useState } from "react";
import Login from "./Onboarding/Login";
import Navigation from "./Navigation/BottomNavigation";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";
import ProfileSetUp from "./Onboarding/SetUp/ProfileSetUp";
import Settings from "./screens/Settings";
import Account from "./screens/SettingsScreens/Account";
import InitalStart from "./Onboarding/InitalStart";
const Stack = createStackNavigator();

export default function App() {
  const [users, setUsers] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerVisible(!isDrawerVisible);
  };

  async function getUser() {
    const user = await supabase.auth.getUser();
    if (user) {
      setUsers(user.data.user);
      setSession(user);
    }
  }
  useEffect(() => {
    getUser();
  }, []);

  async function UsersData() {
    const { data, error } = await supabase
      .from("UserProfileData")
      .select("*")
      .eq("UserProfile_id", session.data.user.id)
      .single();
    if (error) {
      console.log(error);
    } else {
      setProfileData(data);
    }
  }

  useEffect(() => {
    UsersData();
  }, [session]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="InitalStart"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="InitalStart">{() => <InitalStart />}</Stack.Screen>
        <Stack.Screen name="Login">
          {() => (
            <Login
              loading={loading}
              setLoading={setLoading}
              session={session}
              setSession={setSession}
              users={users}
              setUsers={setUsers}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Navigation">
          {() => (
            <Navigation
              users={users}
              setUsers={setUsers}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ProfileSetUp">
          {() => <ProfileSetUp />}
        </Stack.Screen>
        <Stack.Screen name="Settings">{() => <Settings />}</Stack.Screen>
        <Stack.Screen name="Account">
          {() => (
            <Account
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
