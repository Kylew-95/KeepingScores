import { View, Text } from "react-native";
import React from "react";
import ProfileChart from "../../Components/ProfileChart";

export default function ProfileDashBoard({ profileData, setProfileData }) {
  return (
    <View style={{ height: "100%", backgroundColor: "white" }}>
      <ProfileChart />
    </View>
  );
}
