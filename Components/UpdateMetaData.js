import { View, Text, SafeAreaView } from "react-native";
import React, { useState } from "react";
import { TextInput, Button } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function UpdateMetaData({ profileData, setProfileData }) {
  const [firstName, setFirstName] = useState("");

  async function UpdateUserName() {
    const { data: updateData, error: updateError } = await supabase
      .from("UserProfileData")
      .update({
        first_name: firstName,
      })
      .eq("UserProfile_id", profileData.UserProfile_id);

    if (updateError) {
      console.log("Error updating profile data:", updateError.message);
    } else {
      console.log("Profile data updated successfully:", updateData);
      setProfileData((prevProfileData) => ({
        ...prevProfileData,
        first_name: firstName,
      }));
      setFirstName("");
    }
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
      <Button
        style={{
          width: 200,
          alignSelf: "center",
          backgroundColor: "#2193F0",
          marginTop: 20,
        }}
        mode="contained"
        onPress={UpdateUserName}
      >
        <Text style={{ color: "white" }}>Update Name</Text>
      </Button>
    </SafeAreaView>
  );
}
