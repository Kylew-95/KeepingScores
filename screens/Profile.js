import React, { useCallback, useState } from "react";
import { SafeAreaView, ScrollView, RefreshControl } from "react-native";
import { Avatar, Button, Text } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

export default function Profiles({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  console.log("profileData", profileData);

  async function changeProfilePicture() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        const imagePath = `${profileData.UserProfile_id}/avatar ${profileData.id}.png`;

        const { data, error } = await supabase.storage
          .from("avatar-images")
          .upload(imagePath, result.assets[0].uri, { cacheControl: "3600" });

        if (error) {
          console.log("Error uploading image:", error.message);
        } else {
          console.log("Image uploaded successfully:", data);

          const { data: updateData, error: updateError } = await supabase
            .from("UserProfileData")
            .update({
              avatar_image_url: result.assets[0].uri,
            })
            .eq("UserProfile_id", profileData.UserProfile_id);

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

  const SignOut = async () => {
    try {
      await supabase.auth.signOut({ redirectTo: "Login" });
      navigation.replace("Login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          backgroundColor: "white",
        }}
        refreshControl={<RefreshControl refreshing={refreshing} />}
      >
        <Button mode="contained" style={{ top: 1 }} onPress={SignOut}>
          Sign Out
        </Button>
        <Avatar.Image
          size={200}
          source={require("../Images/batmanAvatar.png")}
          style={{
            alignSelf: "center",
            marginTop: -10,
            position: "absolute",
            top: 20,
            backgroundColor: "transparent",
          }}
        />
        <Button onPress={changeProfilePicture}>Change Image</Button>
      </ScrollView>
    </SafeAreaView>
  );
}
