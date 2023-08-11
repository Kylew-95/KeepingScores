import React from "react";
import { SafeAreaView } from "react-native";
import { Avatar } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function Profiles() {
  async function getProfile() {
    const { data, error } = await supabase
      .from("NewTable")
      .select("*")
      .single();
    return data;
  }

  getProfile().then((data) => {
    console.log("Fetched data:", data);
  });

  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <Avatar.Image
        size={200}
        source={require("../Images/batmanAvatar.png")}
        style={{
          alignSelf: "center",
          marginTop: -10,
          zIndex: 100,
          position: "absolute",
          top: 10,
        }}
      />
    </SafeAreaView>
  );
}
