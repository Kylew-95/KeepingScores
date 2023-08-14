import React, { useState } from "react";
import { SafeAreaView, Text, View, Image } from "react-native";
import SignInAuth from "./SignInAuth";
import SignUpAuth from "./SignUpAuth";

export default function Login({ session, setSession, userId, setUserId }) {
  const [shown, setShown] = useState(false);

  function ChangeAuthState() {
    setShown(!shown);
  }

  return (
    <View style={{ height: "100%", backgroundColor: "white" }}>
      <View style={{ height: "40%" }}>
        <Image
          source={require("../Images/vecteezy_badminton-sport-equipments-on-green-floor-shuttlecocks_7800858_291.jpg")}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",

            position: "absolute",
          }}
        />
      </View>
      <View
        style={{
          height: "50%",
          justifyContent: "flex-end",
          backgroundColor: "white",
          zIndex: 1,
          borderRadius: 20,
          shadowColor: "#000",
        }}
      >
        <SafeAreaView
        // style={{
        //   flex: 1,
        //   justifyContent: "flex-end",
        //   top: -40,
        //   alignSelf: "center",
        //   width: 300,
        // }}
        >
          {!shown ? (
            <SignInAuth ChangeAuthState={ChangeAuthState} />
          ) : (
            <SignUpAuth userId={userId} ChangeAuthState={ChangeAuthState} />
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}
