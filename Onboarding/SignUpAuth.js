import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

export default function SignUpAuth({ userId, ChangeAuthState }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const signUp = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: "password",
      });

      if (!error) {
        // Upload the image to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from("avatar-images")
          .upload(`${userId}/avatar-image.jpg`, image, {
            cacheControl: "3600",
          });

        if (!uploadError) {
          // Update user profile with name and image URL
          const { data: profileData, error: profileError } = await supabase
            .from("UserProfileData")
            .upsert([
              {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                avatar_image_url: data.Key,
              },
            ]);

          if (!profileError) {
            // Success
          } else {
            console.error("Error updating user profile:", profileError.message);
          }
        } else {
          console.error("Error uploading image:", uploadError.message);
        }
      } else {
        console.error("Error signing up:", error.message);
      }
    } catch (error) {
      console.error("General error:", error.message);
    }
  };

  return (
    <View
      style={{
        alignSelf: "center",
        justifyContent: "center",
        width: "80%",
        top: "-20%",
      }}
    >
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button mode="contained" title="Pick an image" onPress={pickImage}>
        Choose an Avatar
      </Button>
      <Button mode="contained" title="Sign Up" onPress={signUp}>
        Sign Up
      </Button>
      <Text onPress={ChangeAuthState}> Dont have an Account? Sign up </Text>
    </View>
  );
}
