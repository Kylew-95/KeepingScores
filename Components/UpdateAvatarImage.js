import { View, Text } from "react-native";
import React from "react";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function UpdateAvatarImage({
  profileData,
  setProfileData,
  session,
}) {
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

          const { data: updateData, error: updateError } = await supabase
            .from("UserProfileData")
            .update({
              avatar_image_url: result.assets[0].uri,
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

  return (
    <View>
      <Button
        style={{
          width: 200,
          alignSelf: "center",
          backgroundColor: "#2193F0",
          borderRadius: 6,
        }}
        mode="contained"
        onPress={changeProfilePicture}
      >
        Change Image
      </Button>
    </View>
  );
}
