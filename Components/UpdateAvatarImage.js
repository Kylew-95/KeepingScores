import { View } from "react-native";
import React from "react";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

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
        const img = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: "base64",
        });

        const decodedData = decode(base64);

        console.log("Decoded Data Length:", decodedData.byteLength);

        const filePath = `${session.user.id}/${new Date().getTime()}.${
          img.type === "image" ? "png" : "mp4"
        }`;
        const contentType = img.type === "image" ? "image/png" : "video/mp4";
        await supabase.storage
          .from("avatar-images")
          .upload(filePath, decodedData, { contentType });

        const imageURL = `https://qhagflbltaiccnpwghhf.supabase.co/storage/v1/object/public/avatar-images/${filePath}`;

        const { data: updateData, error: updateError } = await supabase
          .from("UserProfileData")
          .update({
            avatar_image_url: imageURL,
          })
          .eq("userprofile_id", session.user.id);

        if (updateError) {
          console.log("Error updating profile data:", updateError.message);
        } else {
          console.log("Profile data updated successfully:", updateData);

          const updatedProfileData = {
            ...profileData,
            avatar_image_url: result.assets[0].uri,
          };
          setProfileData(updatedProfileData);
        }
      }
    } catch (error) {
      console.log("Error:", error.message);
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
