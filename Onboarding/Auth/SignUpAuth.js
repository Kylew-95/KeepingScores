import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

export default function SignUpAuth({
  ChangeAuthState,
  setLoading,
  userId,
  session,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigation = useNavigation();

  async function userSignUp() {
    setLoading(true);
    try {
      const response = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      console.log("Sign-up response:", response.data.user.id);

      if (response.error) {
        console.log("Sign-up error:", response.error);
        setLoading(false);
      } else {
        const userId = response.data.user.id;

        const { data, error } = await supabase.from("UserProfileData").insert([
          {
            userprofile_id: userId,
            first_name: firstName,
            last_name: lastName,
            avatar_image_url: "https://picsum.photos/seed/picsum/200/300",
          },
        ]);

        console.log("User data response:", data);

        if (error) {
          console.error("Error inserting user data:", error.message);
        } else {
          console.log("User data inserted successfully:", data);
          alert("User data inserted successfully");
          setEmail("");
          setPassword("");
          setFirstName("");
          setLastName("");
        }
        setLoading(false);
      }
    } catch (error) {
      console.log("Unexpected error:", error);
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      {/* <Button
        textColor="#2193F0"
        style={{
          backgroundColor: "white",
          borderRadius: 6,
          width: 200,
          alignSelf: "center",
        }}
        mode="contained"
        onPress={changeProfilePicture}
      >
        Add Image
      </Button> */}
      <Button style={styles.button} mode="contained" onPress={userSignUp}>
        Sign Up
      </Button>
      <Text style={styles.signInText} onPress={ChangeAuthState}>
        If you already have an account? Sign in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 0,
    padding: 12,
    width: "80%",
    alignSelf: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "400",
    marginBottom: 20,
    color: "#2193F0",
    alignSelf: "center",
  },
  input: {
    backgroundColor: "white",
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#2193F0",
    borderRadius: 6,
  },
});
