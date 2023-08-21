import React, { useEffect, useState } from "react";
import Login from "./Onboarding/Login";
import BottomNavigation from "./Navigation/BottomNavigation";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";
import SignUp from "./Onboarding/Auth/SignUpAuth";
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
  const [scoresData, setScoresData] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function UsersData() {
    if (session) {
      const { data, error } = await supabase
        .from("UserProfileData")
        .select("*")
        .eq("userprofile_id", session.user.id)
        .single();
      if (error) {
        console.log(error);
      } else {
        setProfileData(data);
      }
    }
  }

  console.log(profileData);

  useEffect(() => {
    UsersData();
  }, [session]);

  const getUserId = () => {
    if (session) {
      return setUsers(session.user);
    } else {
      return null;
    }
  };

  useEffect(() => {
    getUserId();
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
          {() => (
            <SignUp
              session={session}
              setSession={setSession}
              loading={loading}
              setLoading={setLoading}
              profileData={profileData}
              setProfileData={setProfileData}
              users={users}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">{() => <Settings />}</Stack.Screen>
        <Stack.Screen name="Account">
          {() => (
            <Account
              profileData={profileData}
              setProfileData={setProfileData}
              session={session}
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
