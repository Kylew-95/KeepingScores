import React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import RawVsForm, { VsForm as NamedVsForm } from "../../Components/FormComps/VsForm";

const VsForm =
  typeof RawVsForm === "function"
    ? RawVsForm
    : RawVsForm && typeof RawVsForm.default === "function"
    ? RawVsForm.default
    : typeof NamedVsForm === "function"
    ? NamedVsForm
    : null;

export default function AddScoresTab({
  scoresData,
  setScoresData,
  userId,
  profileData,
}) {
  const navigation = useNavigation();

  if (!VsForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#64748B" }}>Loading Match Form...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
