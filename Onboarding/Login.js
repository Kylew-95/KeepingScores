import React, { useState } from "react";
import { SafeAreaView, Text, View, Image } from "react-native";
import SignInAuth from "./Auth/SignInAuth";
import SignUpAuth from "./Auth/SignUpAuth";

export default function Login({ loading, setLoading, userId }) {
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
            <SignInAuth
              loading={loading}
              setLoading={setLoading}
              ChangeAuthState={ChangeAuthState}
            />
          ) : (
            <SignUpAuth
              loading={loading}
              setLoading={setLoading}
              userId={userId}
              ChangeAuthState={ChangeAuthState}
            />
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}
