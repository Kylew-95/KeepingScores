import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function StartHomePage() {
  const navigation = useNavigation();

  function initalStart() {
    setTimeout(() => {
      navigation.navigate("Login");
    }, 4000);
  }
  useEffect(() => {
    initalStart();
  }, []);
  return (
    <View>
      <Text style={{ alignSelf: "center", top: 425, fontSize: 30 }}>
        KEEPING SCORE
      </Text>
    </View>
  );
}
