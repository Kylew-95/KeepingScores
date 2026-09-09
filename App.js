import "react-native-url-polyfill/auto";
import React, { useEffect, useState, useRef } from "react";
import Login from "./Onboarding/Login";
import BottomNavigation from "./Navigation/BottomNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./SupabaseConfig/SupabaseClient";
import SignUp from "./Onboarding/Auth/SignUpAuth";
import Settings from "./screens/Settings";
import Account from "./screens/SettingsScreens/Account";
import RawVsForm, {
  VsForm as NamedVsForm,
} from "./Components/FormComps/VsForm";
const VsForm =
  typeof RawVsForm === "function"
    ? RawVsForm
    : RawVsForm?.default || NamedVsForm;
import StartHomePage from "./Onboarding/StartHomePage";
import { LogBox, Linking } from "react-native";
LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = useRef(null);
  const [users, setUsers] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoresData, setScoresData] = useState([]);

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      try {
        let tokenString = "";
        if (url.includes("#")) {
          tokenString = url.split("#")[1];
        } else if (url.includes("?")) {
          tokenString = url.split("?")[1];
        }

        if (tokenString) {
          const params = new URLSearchParams(tokenString);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (error) {
              console.error(
                "Error setting session from deep link:",
                error.message,
              );
            } else if (data?.session) {
              setSession(data.session);
              if (navigationRef.current?.isReady()) {
                navigationRef.current?.navigate("Navigation");
              }
            }
          }
        }
      } catch (err) {
        console.error("Error processing deep link:", err);
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkingSub = Linking.addEventListener("url", (event) =>
      handleDeepLink(event.url),
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && navigationRef.current?.isReady()) {
        navigationRef.current?.navigate("Navigation");
      }
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && navigationRef.current?.isReady()) {
        navigationRef.current?.navigate("Navigation");
      }
    });

    return () => {
      authSub?.unsubscribe();
      linkingSub?.remove();
    };
  }, []);

  async function fetchUserProfile(currentSession) {
    if (currentSession?.user?.id) {
      const { data, error } = await supabase
        .from("UserProfileData")
        .select("*")
        .eq("userprofile_id", currentSession.user.id)
        .single();
      if (error) {
        if (error.code === "PGRST116") {
          // Profile row doesn't exist yet (e.g. fresh Google OAuth sign-in)
          const meta = currentSession.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || "";
          const nameParts = fullName.trim().split(" ");
          const firstName =
            nameParts[0] ||
            currentSession.user.email?.split("@")[0] ||
            "Player";
          const lastName = nameParts.slice(1).join(" ") || "";
          const avatarUrl =
            meta.avatar_url ||
            meta.picture ||
            "https://picsum.photos/seed/picsum/200/300";

          const { data: created, error: createErr } = await supabase
            .from("UserProfileData")
            .insert([
              {
                userprofile_id: currentSession.user.id,
                first_name: firstName,
                last_name: lastName,
                avatar_image_url: avatarUrl,
              },
            ])
            .select()
            .single();

          if (!createErr && created) {
            setProfileData(created);
            return;
          }
        }
        console.log("Error fetching profile data:", error.message || error);
      } else {
        setProfileData(data);
      }
    }
  }

  useEffect(() => {
    if (session?.user) {
      setUserId(session.user.id);
      fetchUserProfile(session);
    } else {
      setProfileData(null);
      setUserId(null);
    }
  }, [session]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (session) {
          navigationRef.current?.navigate("Navigation");
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
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
        <Stack.Screen name="Home">{() => <Home />}</Stack.Screen>
        <Stack.Screen name="ProfileSetUp">
          {() => (
            <SignUp
              session={session}
              setSession={setSession}
              loading={loading}
              setLoading={setLoading}
              profileData={profileData}
              setProfileData={setProfileData}
              userId={userId}
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
              setSession={setSession}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Match Form">
          {() => (
            <VsForm
              scoresData={scoresData}
              setScoresData={setScoresData}
              profileData={profileData}
              userId={userId}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
