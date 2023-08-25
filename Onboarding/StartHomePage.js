import { View, Text, Image, Dimensions } from "react-native";
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
  const windowWidth = Dimensions.get("window").width;
  return (
    <View>
      {/* <Text style={{ alignSelf: "center", top: 425, fontSize: 30 }}>
        KEEPING SCORE
      </Text> */}
      <Image
        style={{
          alignSelf: "center",
          top: 425,
          width: windowWidth,
          height: 60,
        }}
        source={require("../KeepingscoreIdeation/Logo-Keeping-Score.png")}
      />
    </View>
  );
}
