import React from "react";
import { SafeAreaView, FlatList } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

import { data } from "../../DummyScoresData";

export default function ScoresTab() {
  const renderItem = ({ item }) => (
    <Card style={{ marginTop: 20 }}>
      <Card.Title title={item.Location} />
      <Card.Content>
        <Text>
          Activity: {item.activity}, {item.players[0].player1} VS{" "}
          {item.players[1].player2}, GameRound: {item.gameRound},{" "}
          {item.players[0].scores} - {item.players[1].scores}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
}
