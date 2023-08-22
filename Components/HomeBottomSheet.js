import { View, Text } from "react-native";
import React from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import SegmentFilterButtons from "./SegmentFilterButtons";

export default function HomeBottomSheet({ bottomSheetRef, snapPoints }) {
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundComponent={() => <View style={{ flex: 1 }} />}
    >
      <BottomSheetView
        style={{
          padding: 16,
          backgroundColor: "#00171F",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          flex: 1, // Allow content to take up available space
        }}
      >
        <Text style={{ color: "white" }}>FILTER</Text>
        <SegmentFilterButtons />
      </BottomSheetView>
    </BottomSheet>
  );
}
