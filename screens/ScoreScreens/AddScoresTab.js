import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import VsForm from "../../Components/FormComps/VsForm";

export default function AddScoresTab({
  scoresData,
  setScoresData,
  userId,
  profileData,
}) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <VsForm
        scoresData={scoresData}
        setScoresData={setScoresData}
        profileData={profileData}
        userId={userId}
        isEmbedded={true}
        onSaveSuccess={() => {
          // Switch to My Scores or Leaderboard after saving
          navigation.navigate("My Scores");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
