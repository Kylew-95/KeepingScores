import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

export default function SignUpAndProfileSetup({
  ChangeAuthState,
  setLoading,
  profileData,
  setProfileData,
  users,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigation = useNavigation();

  async function signUp() {
    setLoading(true);
    const { user, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      setLoading(false);
    } else {
      const { data, error } = await supabase.from("UserProfileData").insert([
        {
          id: users.id,
          first_name: firstName,
          last_name: lastName,
          avatar_image_url: "",
        },
      ]);
      if (error) {
        console.error("Error inserting user data:", error.message);
      } else {
        console.log("User data inserted successfully:", data);
        navigation.navigate("Login");
      }
    }
  }

  async function changeProfilePicture() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        const timestamp = new Date().getTime();
        const imagePath = `${profileData.userprofile_id}/avatar_${timestamp}.png`;

        const { data, error } = await supabase.storage
          .from("avatar-images")
          .upload(imagePath, result.assets[0].uri, { cacheControl: "3600" });

        if (error) {
          console.log("Error uploading image:", error.message);
        } else {
          console.log("Image uploaded successfully:", data);

          const updatedProfileData = {
            ...profileData,
            avatar_image_url: result.assets[0].uri,
          };
          setProfileData(updatedProfileData);
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
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
      <Button
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
      </Button>
      <Button style={styles.button} mode="contained" onPress={signUp}>
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
    top: 20,
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
