import React, { useEffect, useState } from "react";
import Login from "./Onboarding/Login";
import Navigation from "./Navigation/BottomNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";

const Stack = createStackNavigator();

export default function App() {
  const [userId, setUserId] = useState(null);
  const [session, setSession] = useState(null);

  async function getUser() {
    const user = await supabase.auth.getUser();
    if (user) {
      setUserId(user.data.user.id);
      setSession(user);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login">
          {() => (
            <Login
              session={session}
              setSession={setSession}
              userId={userId}
              setUserId={setUserId}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Navigation">
          {() => <Navigation userId={userId} setUserId={setUserId} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
