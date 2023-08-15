import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileSetUp({ userId }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);

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

  console.log(userId);

  const setUp = async () => {
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
  };
  return (
    <SafeAreaView
      style={{
        alignSelf: "center",
        justifyContent: "center",
        width: "80%",
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
      <Button mode="contained" title="Pick an image" onPress={pickImage}>
        Choose an Avatar
      </Button>
      <Button mode="contained" title="Set Up" onPress={setUp}>
        Set Up
      </Button>
    </SafeAreaView>
  );
}
