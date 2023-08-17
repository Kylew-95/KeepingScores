import { SafeAreaView, ScrollView, Text } from "react-native";
import React from "react";
import { Appbar, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import UpdateAvatarImage from "../../Components/UpdateAvatarImage";
import UpdateMetaData from "../../Components/UpdateMetaData";

export default function Account({ profileData, setProfileData }) {
  const navigation = useNavigation();

  return (
    <>
      <Appbar.Header style={{ backgroundColor: "#2193F0" }}>
        <Appbar.BackAction
          color="white"
          onPress={() => navigation.navigate("Settings")}
        />
        <Appbar.Content color="white" title="Account" />
      </Appbar.Header>

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", margin: 20 }}>
            Update Profile Picture
          </Text>
          <UpdateAvatarImage
            profileData={profileData}
            setProfileData={setProfileData}
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", margin: 20 }}>
            Update Name
          </Text>
          <UpdateMetaData
            profileData={profileData}
            setProfileData={setProfileData}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
