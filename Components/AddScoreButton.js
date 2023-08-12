import { SafeAreaView, Image, TouchableWithoutFeedback } from "react-native";
import React, { useState } from "react";
import { Button } from "react-native-paper";

export default function AddScoreButton() {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    // Handle button press action here
    // For example: navigate to a new screen, show a modal, etc.
  };

  return <SafeAreaView></SafeAreaView>;
}
