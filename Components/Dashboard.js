import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { Card } from "react-native-paper";

export default function Dashboard() {
  return (
    <SafeAreaView style={{ height: 800 }}>
      <Card
        style={{
          width: "80%",
          height: 90,
          alignSelf: "center",
          top: -40,
          zIndex: 20,
          backgroundColor: "white",
        }}
      >
        <Card.Title title="Card Title" subtitle="Card Subtitle" />
      </Card>
      <Card
        style={{
          width: "80%",
          height: 130,
          alignSelf: "center",
          top: -40,
          marginTop: 20,
          backgroundColor: "white",
        }}
      >
        <Card.Title title="Card Title" subtitle="Card Subtitle" />
      </Card>
      <Text
        style={{
          left: 40,
          top: -30,
          marginTop: 20,
          fontSize: 22,
          fontWeight: 500,
        }}
      >
        Set a Goal
      </Text>
      <Card
        style={{
          width: "80%",
          height: 400,
          alignSelf: "center",
          top: -40,
          marginTop: 20,
          marginBottom: 40,
          backgroundColor: "white",
        }}
      >
        <Card.Title title="Card Title" subtitle="Card Subtitle" />
      </Card>
    </SafeAreaView>
  );
}
