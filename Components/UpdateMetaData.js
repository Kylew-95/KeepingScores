import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useState } from "react";
import { TextInput, Button } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";
//
export default function UpdateMetaData({
  profileData,
  setProfileData,
  session,
}) {
  const [firstName, setFirstName] = useState("");

  async function UpdateUserName() {
    const { data: updateData, error: updateError } = await supabase
      .from("UserProfileData")
      .update({
        first_name: firstName,
      })
      .eq("userprofile_id", session.user.id);

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
        style={styles.stettingsTextbox}
        mode="outlined"
        placeholder="User Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Button
        style={{
          width: 200,
          alignSelf: "center",
          backgroundColor: "#2193F0",
          borderRadius: 6,
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

const styles = StyleSheet.create({
  stettingsTextbox: {
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 6,
    height: 30,
  },
});
