import { View, Text } from "react-native";
import React from "react";
import { postDummyImages } from "../postDummy/PostDummyImages";
import { FlatList, Image } from "react-native";
import { LikesIcon } from "./InteractionIcons/LikesIcon";
import { Avatar, Divider } from "react-native-paper";

export default function ImgContainerNew({ profileData }) {
  const renderItem = ({ item }) => {
    if (!item) {
      console.log("Item is undefined");
      return null;
    }
    return (
      <View
        style={{
          // width: `${100 / 3}%`,
          margin: 40,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 60,
        }}
      >
        <View
          style={{
            position: "absolute",
            flex: 1,
            flexDirection: "row",
            alignSelf: "flex-start",
            right: 30,
            width: "118%",
            alignItems: "center",
            left: -30,
            zIndex: 200,
            top: -70,
            height: 50,
            marginTop: 10,
          }}
        >
          <Avatar.Image
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 10,
              backgroundColor: "transparent",
            }}
            size={40}
            source={{
              uri: profileData.avatar_image_url,
            }}
          />
          <Text
            style={{
              position: "absolute",
              top: 20,
              left: 60,
              zIndex: 10,
              backgroundColor: "transparent",
              color: "black",
              fontWeight: "bold",
            }}
          >
            {profileData.first_name}
          </Text>
        </View>
        <Image
          style={{
            width: 400,
            height: 450,
            resizeMode: "contain",
            margin: 2,
            borderRadius: 10,
            bottom: 10,
          }}
          source={item.image}
        />
        <View style={{}}>
          <LikesIcon />
        </View>
      </View>
    );
  };

  return (
    <View style={{ top: 10 }}>
      <FlatList
        data={postDummyImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
      />
    </View>
  );
}
