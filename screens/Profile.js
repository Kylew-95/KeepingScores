import React from "react";
import { SafeAreaView } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";
export default function Profiles() {
  const navigation = useNavigation();

  const SignOut = async () => {
    const { error } = await supabase.auth.signOut({ redirectTo: "Login" }).then;
    if (error) {
      console.log(error);
    } else {
      navigation.navigate("Login");
    }
  };

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
          backgroundColor: "transparent",
        }}
      />
      <Button mode="contained" style={{ top: 300 }} onPress={SignOut}>
        Sign Out
      </Button>
    </SafeAreaView>
  );
}
