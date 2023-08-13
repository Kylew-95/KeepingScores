import React, { useState } from "react";
import Login from "./Onboarding/Login";
import Navigation from "./Navigation/BottomNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" headerMode="none">
        <Stack.Screen name="Login">
          {() => <Login session={session} setSession={setSession} />}
        </Stack.Screen>
        <Stack.Screen name="Navigation" component={Navigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
