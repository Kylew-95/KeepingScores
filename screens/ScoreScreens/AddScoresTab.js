import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import AddScoreButton from "../../Components/AddScoreButton";
import { supabase } from "../../SupabaseConfig/SupabaseClient";

export default function AddScoresTab({ scoresData, setScoresData, userId }) {
  const [formData, setFormData] = useState({
    location: "",
    nameofActivity: "",
    gameRound: "",
    player1: "",
    player2: "",
    player1scores: "",
    player2scores: "",
  });

  async function insertDataToTable() {
    if (
      !formData.location ||
      !formData.nameofActivity ||
      !formData.gameRound ||
      !formData.player1 ||
      !formData.player2 ||
      !formData.player1scores ||
      !formData.player2scores
    ) {
      console.log("All fields are required");
      alert("All fields are required");
      return;
    }

    const { data, error } = await supabase
      .from("ScoresData")
      .upsert({
        location: formData.location,
        activity: formData.nameofActivity,
        gameRound: formData.gameRound,
        players: [
          { player1: formData.player1, scores: formData.player1scores },
          { player2: formData.player2, scores: formData.player2scores },
        ],
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      })
      .select();

    if (error) {
      console.log("error", error);
    } else {
      // console.log("data", data);
      scoresData.push(data);
      setScoresData([...scoresData]);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <Card
        style={{
          margin: 20,
          padding: 30,
          width: 350,
          alignSelf: "center",
          top: 20,
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "300", left: 20 }}>
            Location
          </Text>
          <TextInput
            value={formData.location}
            mode="outlined"
            onChangeText={(text) => handleInputChange("location", text)}
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
            value={formData.nameofActivity}
            mode="outlined"
            onChangeText={(text) => handleInputChange("nameofActivity", text)}
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
            value={formData.gameRound}
            mode="outlined"
            onChangeText={(text) => handleInputChange("gameRound", text)}
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
            value={formData.player1}
            mode="outlined"
            onChangeText={(text) => handleInputChange("player1", text)}
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
            value={formData.player2}
            mode="outlined"
            onChangeText={(text) => handleInputChange("player2", text)}
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
            value={formData.player1scores}
            mode="outlined"
            onChangeText={(text) => handleInputChange("player1scores", text)}
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
            value={formData.player2scores}
            mode="outlined"
            onChangeText={(text) => handleInputChange("player2scores", text)}
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
      <AddScoreButton dataTable={insertDataToTable} setFormData={setFormData} />
    </SafeAreaView>
  );
}
