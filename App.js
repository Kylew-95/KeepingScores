import React, { useEffect, useState } from "react";
import Login from "./Onboarding/Login";
import Navigation from "./Navigation/BottomNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";
import ProfileSetUp from "./Onboarding/SetUp/ProfileSetUp";

const Stack = createStackNavigator();

export default function App() {
  const [users, setUsers] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

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
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* <Stack.Screen name="Login">
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
        </Stack.Screen> */}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
