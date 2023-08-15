import { SafeAreaView, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

export default function AddScoreButton({ dataTable }) {
  const handlePress = () => {
    console.log("dataTable:", dataTable);
    dataTable();
  };

  return (
    <SafeAreaView style={{ top: 23 }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          alignSelf: "center",
          justifyContent: "center",
          width: 50,
          height: 50,
          borderRadius: 35,
          backgroundColor: "#2193F0",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          elevation: 4,
        }}
      >
        <Image
          source={require("../Images/plusIcon.png")}
          style={{
            width: 50,
            height: 50,
            alignSelf: "center",
          }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
