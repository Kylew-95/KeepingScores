import React from "react";
import { SafeAreaView, Text, View, Image } from "react-native";
import SignInAuth from "./SignInAuth";

export default function Login({ session, setSession, userId, setUserId }) {
  return (
    <View style={{ height: "100%", backgroundColor: "white" }}>
      <View style={{ height: "50%" }}>
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
          style={{
            flex: 1,
            justifyContent: "flex-end",
            top: -40,
            alignSelf: "center",
            width: 300,
          }}
        >
          <Text
            style={{
              marginBottom: 20,
              textAlign: "center",
              fontSize: 30,
              fontWeight: 600,
              color: "#2193f0",
            }}
          >
            Sign In
          </Text>
          <SignInAuth
            session={session}
            setSession={setSession}
            userId={userId}
            setUserId={setUserId}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}
