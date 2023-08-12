import React from "react";
import { SafeAreaView, View } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import AddScoreButton from "../../Components/AddScoreButton";

export default function AddScoresTab() {
  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <Card
        style={{ margin: 20, padding: 30, width: 350, alignSelf: "center" }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
            Location
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 40,
              width: 250,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
            Name of Activity
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 40,
              width: 250,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
            Game Round{" "}
          </Text>
          <TextInput
            mode="outlined"
            style={{
              height: 40,
              width: 240,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
          Player Names
        </Text>
        <View
          style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}
        >
          <TextInput
            mode="outlined"
            style={{
              height: 35,
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
              height: 35,
              width: 100,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
          Scores
        </Text>
        <View
          style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}
        >
          <TextInput
            mode="outlined"
            style={{
              height: 35,
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
              height: 35,
              width: 100,
              margin: 10,
              backgroundColor: "white",
              display: "flex",
              alignSelf: "center",
            }}
          ></TextInput>
        </View>
      </Card>
      <AddScoreButton />
    </SafeAreaView>
  );
}
