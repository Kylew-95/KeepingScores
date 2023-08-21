import React, { useEffect, useState } from "react";
import Login from "./Onboarding/Login";
import BottomNavigation from "./Navigation/BottomNavigation";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";
import ProfileSetUp from "./Onboarding/SetUp/ProfileSetUp";
import Settings from "./screens/Settings";
import Account from "./screens/SettingsScreens/Account";
import VsForm from "./Components/FormComps/VsForm";
import StartHomePage from "./Onboarding/StartHomePage";
const Stack = createStackNavigator();

export default function App() {
  const [users, setUsers] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [scoresData, setScoresData] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("NewSession", session);
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("NewerSesssion", session);
      setSession(session);
    });
  }, []);

  async function UsersData() {
    if (session) {
      const { data, error } = await supabase
        .from("UserProfileData")
        .select("*")
        .eq("UserProfile_id", session.user.id)
        .single();
      if (error) {
        console.log(error);
      } else {
        setProfileData(data);
      }
    }
  }

  useEffect(() => {
    UsersData();
  }, [session]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="StartHomePage"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="StartHomePage">
          {() => <StartHomePage />}
        </Stack.Screen>
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
            <BottomNavigation
              users={users}
              setUsers={setUsers}
              profileData={profileData}
              setProfileData={setProfileData}
              scoresData={scoresData}
              setScoresData={setScoresData}
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
        <Stack.Screen name="Match Form">
          {() => (
            <VsForm scoresData={scoresData} setScoresData={setScoresData} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
