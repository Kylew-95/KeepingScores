import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Input } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

export default function SignInAuth({ setSession }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    async function loadSession() {
      try {
        const savedSession = await AsyncStorage.getItem("supabaseSession");
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);

          // Check if the saved session is still valid
          if (parsedSession.expires_at > Date.now()) {
            // Reauthenticate the user with the saved session
            supabase.auth.signIn({ session: parsedSession });
          } else {
            // Session has expired, you might want to prompt the user to log in again
          }

          setSession(parsedSession);
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
    }

    loadSession();
  }, []);

  async function signinWithGmail() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        console.error("Google sign-in error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail() {
    try {
      setLoading(true);
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Email sign-in error:", error.message);
      } else {
        // Sign-in successful, navigate to the next screen
        navigation.navigate("Navigation");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        title="Google"
        disabled={loading}
        onPress={() => signinWithGmail()}
      >
        Sign in With Google
      </Button>
      <View style={styles.container}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={"none"}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={"none"}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title="Sign in"
            disabled={loading}
            onPress={() => signInWithEmail()}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});