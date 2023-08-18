import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { Modal, Portal, Button, PaperProvider } from "react-native-paper";

export default function ProfileChart() {
  const [clickedValue, setClickedValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDataPointClick = (value) => {
    setClickedValue(value);
    setModalVisible(true);
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
        width={Dimensions.get("window").width}
        height={210}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0, // optional, defaults to 2dp
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
      <PaperProvider>
        <Portal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ backgroundColor: "white", padding: 20 }}>
                <Text>
                  Dataset: {clickedValue.dataset.data[clickedValue.index]}
                </Text>
                {/* {console.log(clickedValue.dataset.data[clickedValue.index])} */}
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>
      </PaperProvider>
    </View>
  );
}
