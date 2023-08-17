import { SafeAreaView, Text } from "react-native";
import React, { useRef } from "react";
import Maps from "../Components/Maps";
import HomeBottomSheet from "../Components/HomeBottomSheet";

export default function Home({ profileData }) {
  const bottomSheetRef = useRef(null);

  const snapPoints = [1, "50%"];

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
    }
  };

  const closeBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  };

  return (
    <SafeAreaView style={{ height: "100%", backgroundColor: "white" }}>
      {/* <Text style={{ alignItems: "center", fontSize: 40 }}>
        UNDER CONSTRUCTION
      </Text> */}
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
