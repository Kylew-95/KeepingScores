import { SafeAreaView, Text } from "react-native";
import React, { useRef } from "react";
import Maps from "../Components/Maps";
import HomeBottomSheet from "../Components/HomeBottomSheet";

export default function Home({ profileData }) {
  const bottomSheetRef = useRef(null);

  const snapPoints = [1, "50%"];

  const openBottomSheet = () => {
    console.log("Opening bottom sheet");
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
    }
  };

  const closeBottomSheet = () => {
    console.log("Closing bottom sheet");
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Maps
        profileData={profileData}
        openBottomSheet={openBottomSheet}
        closeBottomSheet={closeBottomSheet}
      />
      <HomeBottomSheet
        bottomSheetRef={bottomSheetRef}
        snapPoints={snapPoints}
      />
    </SafeAreaView>
  );
}
