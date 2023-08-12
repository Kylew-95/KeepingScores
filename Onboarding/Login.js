import React from "react";
import { SafeAreaView, Text } from "react-native";
import SignInAuth from "./SignInAuth";

export default function Login({ session, setSession }) {
  return (
    <SafeAreaView style={{ marginTop: 100 }}>
      <SignInAuth session={session} setSession={setSession} />
    </SafeAreaView>
  );
}
