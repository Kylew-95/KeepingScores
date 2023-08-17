import { SafeAreaView } from "react-native";
import React from "react";
import ImgContainerNew from "../../Components/ImgContainerNew";

export default function ConnectTab({ profileData }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", height: "100%" }}>
      <ImgContainerNew profileData={profileData} />
    </SafeAreaView>
  );
}
