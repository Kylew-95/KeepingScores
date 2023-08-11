import React from "react";
import { SafeAreaView, Text } from "react-native";
import SignInAuth from "./SignIn";

export default function Login() {
  return (
    <SafeAreaView style={{ marginTop: 100 }}>
      <SignInAuth />
    </SafeAreaView>
  );
}
