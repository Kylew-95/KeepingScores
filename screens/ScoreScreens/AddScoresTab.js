import { SafeAreaView, View } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React from "react";

export default function AddScoresTab() {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <Card style={{ margin: 10, padding: 10 }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 60 }}>
            Location
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 50,
              width: 250,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 60 }}>
            Name of Activity
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 50,
              width: 250,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 60 }}>
            Game Round{" "}
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 50,
              width: 250,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "300", left: 60 }}>
          Player Names
        </Text>
        <View
          style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}
        >
          <TextInput
            mode="outlined"
            style={{
              height: 50,
              width: 100,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
          <Text style={{ fontSize: 20, top: 25 }}>VS</Text>
          <TextInput
            mode="outlined"
            style={{
              height: 50,
              width: 100,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
      </Card>
    </SafeAreaView>
  );
}
