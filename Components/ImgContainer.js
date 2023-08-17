import { View, Text } from "react-native";
import React from "react";
import { postDummyImages } from "../postDummy/PostDummyImages";
import { FlatList, Image } from "react-native";

export default function ImgContainer() {
  const renderItem = ({ item }) => {
    if (!item) {
      console.log("Item is undefined");
      return null;
    }
    return (
      <View
        style={{
          width: `${100 / 3}%`,
          margin: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          style={{
            width: 110,
            height: 110,
            resizeMode: "cover",
            margin: 2,
            borderRadius: 10,
          }}
          source={item.image}
        />
      </View>
    );
  };

  return (
    <View style={{ top: 10 }}>
      <FlatList
        data={postDummyImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
      />
    </View>
  );
}
