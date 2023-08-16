import { SafeAreaView, Text } from "react-native";
import React from "react";
import Maps from "../Components/Maps";

export default function Home({ profileData }) {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      {/* <Text style={{ alignItems: "center", fontSize: 40 }}>
        UNDER CONSTRUCTION
      </Text> */}
      <Maps profileData={profileData} />
    </SafeAreaView>
  );
}
