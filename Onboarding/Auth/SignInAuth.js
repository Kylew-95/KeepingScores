import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, SafeAreaView } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

export default function SignInAuth({
  ChangeAuthState,
  loading,
  setLoading,
  session,
  setSession,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  const signinWithGmail = async () => {
    // setLoading(true);
    const { session, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const signInWithEmail = async () => {
    try {
      setLoading(true);
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Email sign-in error:", error.message);
      } else {
        navigation.navigate("Navigation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          position: "absolute",
          // height: "70%",
          top: -560,
          width: "100%",
          // backgroundColor: "#2193f0",
          borderBottomLeftRadius: 500,
          borderBottomRightRadius: 500,
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "flex-end",
            top: 70,
            alignSelf: "center",
            width: 300,
          }}
        >
          <Text
            style={{
              marginBottom: 20,
              textAlign: "center",
              fontSize: 30,
              fontWeight: 600,
              color: "#2193f0",
            }}
          >
            Sign In
          </Text>
          <Button
            mode="outlined"
            disabled={loading}
            onPress={signinWithGmail}
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              top: 30,
              alignContent: "center",
            }}
          >
            <Image
              source={require("../../Images/googleicon.png")}
              style={{ width: 18, height: 18, top: 6, marginLeft: 10 }}
            />
            <Text style={{ color: "black" }}>Sign in With Google</Text>
          </Button>
          <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <TextInput
                style={{ backgroundColor: "white" }}
                mode="outlined"
                label="Email"
                leftIcon={{ type: "font-awesome", name: "envelope" }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.verticallySpaced}>
              <TextInput
                style={{ backgroundColor: "white" }}
                mode="outlined"
                label="Password"
                leftIcon={{ type: "font-awesome", name: "lock" }}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry
                placeholder="Password"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Button
                mode="contained"
                title="Sign in"
                disabled={loading}
                onPress={signInWithEmail}
                style={{ borderRadius: 8, backgroundColor: "#2193f0" }}
              >
                Sign in
              </Button>
            </View>
          </View>
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={ChangeAuthState}
          >
            Dont have an account? Sign up
          </Text>
        </SafeAreaView>
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
