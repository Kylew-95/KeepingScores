import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

export default function SignUpAuth({
  ChangeAuthState,
  loading,
  setLoading,
  userId,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      setLoading(false);
      navigation.navigate("Login");
    } else {
      navigation.navigate("ProfileSetUp");
    }
  }

  return (
    <>
      <View style={{ bottom: "-1%" }}>
        <Text
          style={{
            marginBottom: 225,
            textAlign: "center",
            fontSize: 30,

            color: "#2193f0",
          }}
        >
          Sign Up
        </Text>
        <View
          style={{
            alignSelf: "center",
            justifyContent: "center",
            width: "67%",
            top: "-20%",
          }}
        >
          <TextInput
            mode="outlined"
            style={
              (styles.verticallySpaced,
              { top: "-30%", backgroundColor: "white" })
            }
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            mode="outlined"
            style={
              (styles.verticallySpaced,
              { top: "-25%", backgroundColor: "white" })
            }
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            style={{ borderRadius: 8, backgroundColor: "#2193f0", top: "-9%" }}
            mode="contained"
            title="Sign Up"
            onPress={signUp}
          >
            Sign Up
          </Button>
          <Text
            style={{ textDecorationLine: "underline", right: "5%" }}
            onPress={ChangeAuthState}
          >
            If you already have an account? Sign in{" "}
          </Text>
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
