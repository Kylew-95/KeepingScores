import React, { useState } from "react";
import { SafeAreaView, Text, View, Image, Dimensions } from "react-native";
import SignInAuth from "./Auth/SignInAuth";
import SignUpAuth from "./Auth/SignUpAuth";

export default function Login({
  loading,
  setLoading,
  userId,
  session,
  setSession,
}) {
  const [shown, setShown] = useState(false);

  function ChangeAuthState() {
    setShown(!shown);
  }

  const windowWidth = Dimensions.get("window").width;
  return (
    <View style={{ backgroundColor: "white" }}>
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
      <Image
        style={{
          alignSelf: "center",
          top: 25,
          left: 140,
          height: 60,
          width: 260,
          position: "absolute",
          zIndex: 4,
        }}
        resizeMode="contain"
        source={require("../KeepingscoreIdeation/Logo-Keeping-Score.png")}
      />

      <View
        style={{
          height: "60%",
          justifyContent: "flex-end",
          backgroundColor: "white",
          zIndex: 1,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
        }}
      >
        <SafeAreaView>
          {!shown ? (
            <SignInAuth
              session={session}
              setSession={setSession}
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
              session={session}
            />
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}
