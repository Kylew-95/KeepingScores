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
    <View>
      <Text>Step Counter</Text>
      <LineChart
        data={{
          legend: ["Steps"],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              data: [
                Math.random() * 10000,
                Math.random() * 10000,
                Math.random() * 10000,
                Math.random() * 10000,
                Math.random() * 10000,
                Math.random() * 10000,
              ],
            },
          ],
        }}
        renderDotContent={({ x, y, index, value }) => (
          <>
            {clickedIndex === index && (
              <Text
                key={index}
                style={{
                  position: "absolute",
                  left: x - 10,
                  top: y - 10, // Adjust vertical position
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
        width={Dimensions.get("window").width}
        height={210}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        onDataPointClick={(value) => handleDataPointClick(value)}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}
