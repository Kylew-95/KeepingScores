import { View } from "react-native";
import React from "react";
import { Button } from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function DeleteScoreButton({
  score,
  scoresData,
  setScoresData,
}) {
  const deleteScore = async () => {
    try {
      const { data, error } = await supabase
        .from("ScoresData")
        .delete()
        .match({ id: score.id });

      if (error) {
        console.error("Error deleting score:", error.message);
      } else {
        console.log("Score deleted successfully:", data);

        const updatedScoresData = scoresData.filter(
          (item) => item.id !== score.id
        );
        setScoresData(updatedScoresData);
      }
    } catch (error) {
      console.error("Error deleting score:", error.message);
    }
  };

  return (
    <View>
      <Button
        style={{
          textAlign: "center",
          width: 126,
          height: 40,
          left: 20,
          borderRadius: 6,
          backgroundColor: "red",
        }}
        mode="contained"
        onPress={deleteScore}
      >
        DeleteScore
      </Button>
    </View>
  );
}
