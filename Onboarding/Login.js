import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import SignInAuth from "./SignInAuth";

export default function Login({ session, setSession }) {
  return (
    <View style={{ height: "100%", backgroundColor: "white" }}>
      <SafeAreaView
        style={{
          marginTop: 100,
          alignSelf: "center",
          width: 300,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            fontWeight: 600,
            color: "#2193f0",
          }}
        >
          Sign In
        </Text>
        <SignInAuth session={session} setSession={setSession} />
      </SafeAreaView>
    </View>
  );
}
