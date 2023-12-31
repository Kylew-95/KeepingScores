import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function ProfileSetUp({
  userId,
  session,
  profileData,
  setProfileData,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function changeProfilePicture() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const timestamp = new Date().getTime();
        const imagePath = `${profileData.userprofile_id}/avatar_${timestamp}.png`;

        const { data, error } = await supabase.storage
          .from("avatar-images")
          .upload(imagePath, result.assets[0].uri, { cacheControl: "3600" });

        if (error) {
          console.log("Error uploading image:", error.message);
        } else {
          console.log("Image uploaded successfully:", data);

          // Local change
          const updatedProfileData = {
            ...profileData,
            avatar_image_url: result.assets[0].uri,
          };
          setProfileData(updatedProfileData);
          setFirstName(updatedProfileData.first_name);
          setLastName(updatedProfileData.last_name);

          const { data: updateData, error: updateError } = await supabase
            .from("UserProfileData")
            .update({
              first_name: firstName,
              last_name: lastName,
              avatar_image_url: "https://picsum.photos/200/300",
            })
            .eq("userprofile_id", session.user.id);

          if (updateError) {
            console.log("Error updating profile data:", updateError.message);
          } else {
            console.log("Profile data updated successfully:", updateData);
          }
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  }

  const navigation = useNavigation();

  async function setUp() {
    navigation.navigate("Login");
  }

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
      <Button
        mode="contained"
        title="Pick an image"
        onPress={changeProfilePicture}
      >
        Choose an Avatar
      </Button>
      <Button mode="contained" title="Set Up" onPress={setUp}>
        Set Up
      </Button>
    </SafeAreaView>
  );
}
