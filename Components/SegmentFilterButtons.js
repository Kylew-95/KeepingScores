import { SafeAreaView, Text } from "react-native";
import React, { useState } from "react";

export default function SegmentFilterButtons() {
  const [selectedSport, setSelectedSport] = useState("");

  const sportsFilter = [
    {
      value: "football",
      label: "Football",
    },
    // {
    //   value: "basketball",
    //   label: "Basketball",
    // },
    {
      value: "tennis",
      label: "Tennis",
    },
    {
      value: "badminton",
      label: "Badminton",
    },
    //     {
    //       value: "volleyball",
    //       label: "Volleyball",
    //     },
    //     {
    //       value: "baseball",
    //       label: "Baseball",
    //     },
    //     {
    //       value: "golf",
    //       label: "Golf",
    //     },
    //     {
    //       value: "hockey",
    //       label: "Hockey",
    //     },
    {
      value: "swimming",
      label: "Swimming",
    },
  ];

  return <SafeAreaView></SafeAreaView>;
}
