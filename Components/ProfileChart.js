import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { LineChart } from "react-native-chart-kit";

export default function ProfileChart() {
  const [clickedIndex, setClickedIndex] = useState(null);
  const [clickedValue, setClickedValue] = useState(null);

  const handleDataPointClick = (value) => {
    setClickedValue(value.value);
    setClickedIndex(value.index);
  };

  return (
    <View
      style={{
        top: -30,
        alignSelf: "center",
      }}
    >
      <Text
        style={{
          marginTop: 20,
          fontSize: 22,
          fontWeight: 500,
        }}
      >
        Step Counter
      </Text>
      <LineChart
        data={{
          legend: ["Steps"],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              data: ["1000", "2200", "3000", "4000", "5000", "6000", "7000"],
            },
          ],
        }}
        renderDotContent={({ x, y, index }) => (
          <>
            {clickedIndex === index && (
              <Text
                key={index}
                style={{
                  position: "absolute",
                  left: x - 10,
                  top: y - 10,
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                {Math.round(clickedValue)}
                {console.log(clickedValue)}
                {console.log(clickedIndex)}
                {/* {Math.round(clickedIndex?.dataset.data)} */}
              </Text>
            )}
          </>
        )}
        width={370}
        height={210}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#2193F0",
          backgroundGradientFrom: "#2193F0",
          backgroundGradientTo: "#219340",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        onDataPointClick={(value) => handleDataPointClick(value)}
        bezier
        style={{
          marginVertical: 3,
          borderRadius: 16,
        }}
      />
    </View>
  );
}
