import React, { useState, useEffect } from "react";
import { SafeAreaView, FlatList } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";

// import { data } from "../../DummyScoresData";

export default function ScoresTab({ scoresData, setScoresData }) {
  async function fetchScores() {
    try {
      let fetchedData = await supabase.from("ScoresData").select("*");
      setScoresData(fetchedData.data);
      console.log("Fetched data:", fetchedData.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  useEffect(() => {
    fetchScores();
  }, []);

  const renderItem = ({ item }) => {
    if (!item) {
      console.log("Item is undefined");
      return null;
    }
    return (
      <Card
        style={{
          marginTop: 40,
          marginBottom: 4,
          width: 370,
          alignSelf: "center",
        }}
      >
        <Card.Content>
          <Text style={{ fontSize: 23, fontWeight: 700, top: -45, right: 15 }}>
            {item.location}
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 12,
              fontWeight: 300,
              top: -20,
              left: 220,
            }}
          >
            {item.date}
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 14,
              fontWeight: 800,
              top: 3,
              alignSelf: "center",
            }}
          >
            {item.players[0].player1} VS {item.players[1].player2}
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 13,
              fontWeight: 300,
              top: 3,
              left: 300,
              alignSelf: "center",
            }}
          >
            {item.time}
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 14,
              fontWeight: 800,
              top: 25,
              alignSelf: "center",
            }}
          >
            {item.players[0].scores} - {item.players[1].scores}
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 13.1,
              fontWeight: 300,
              top: 20,
              right: 270,
              alignSelf: "center",
            }}
          >
            GameRound:{" "}
            <Text style={{ fontSize: 14, fontWeight: 800, color: "#2193F0" }}>
              {item.gameRound}
            </Text>
          </Text>
          <Text
            style={{
              position: "absolute",
              fontSize: 12,
              fontWeight: 300,
              top: 45,
              left: 302,
            }}
          >
            {item.activity}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <FlatList
        data={scoresData}
        renderItem={renderItem}
        keyExtractor={(item) => {
          item.id;
        }}
      />
    </SafeAreaView>
  );
}
