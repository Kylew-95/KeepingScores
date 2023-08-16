import React, { useCallback, useState } from "react";
import { SafeAreaView, ScrollView, RefreshControl } from "react-native";
import { Avatar, Button, Drawer, IconButton } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

export default function Profiles({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  const [refreshing, setRefreshing] = useState(false);

  async function TestButton() {
    console.log(
      "users",
      (await supabase.auth.getSession()).data.session.access_token
    );
  }

  return (
    <>
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
          <Avatar.Image
            size={160}
            source={{ uri: profileData?.avatar_image_url }}
            style={{
              alignSelf: "center",
              marginTop: -10,
              position: "absolute",
              top: 20,
              backgroundColor: "transparent",
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
