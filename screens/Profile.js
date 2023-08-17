import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { Avatar, Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import SocialUserStats from "../Components/SocialUserStats";
import ImgContainer from "../Components/ImgContainerNew";

export default function Profiles({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white", height: "100%" }}
      >
        <Appbar.Header style={{ height: 150 }}>
          <Image
            style={{
              position: "absolute",
              resizeMode: "cover",
              width: 500,
              height: 250,
              top: -50,
              marginLeft: -20,
              zIndex: -10,
              backgroundColor: "transparent",
            }}
            source={require("../Images/alicja-gancarz-wvDELsJ_E20-unsplash.jpg")}
          />
          <View
            style={{
              position: "absolute",
              top: 90,
              alignSelf: "center",
              backgroundColor: "transparent",
              zIndex: 20,
              flex: 1,
              left: 100,
            }}
          >
            <SocialUserStats profileData={profileData} />
          </View>
          <Avatar.Image
            style={{
              position: "absolute",
              zIndex: 30,
              top: 55,
              left: 10,
              backgroundColor: "transparent",
            }}
            size={90}
            source={{
              uri: profileData.avatar_image_url,
            }}
          />
          <View style={{ top: -70 }}>
            <TouchableOpacity style={styles.container}>
              <Text style={styles.headerUserName}>
                {profileData.first_name}
              </Text>
              <Avatar.Image
                source={require("../Images/downArrowicon.png")}
                style={styles.arrowIcon}
                backgroundColor="transparent"
                size={23}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{
                position: "absolute",
                zIndex: 10,
                top: 10,
                backgroundColor: "transparent",
              }}
            >
              <Avatar.Image
                style={{
                  position: "absolute",
                  zIndex: 10,
                  left: 370,
                  backgroundColor: "transparent",
                }}
                size={25}
                source={require("../Images/3Dots.png")}
                tintColor="white"
              />
            </TouchableOpacity>
          </View>
        </Appbar.Header>

        <SafeAreaView
          style={{ flex: 1, backgroundColor: "white", height: "100%" }}
        >
          <View style={{ marginTop: 20 }}></View>
          <ImgContainer profileData={profileData} />
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    left: 15,
    top: 5,
  },
  headerUserName: {
    fontSize: 20,
    marginRight: 5,
    fontWeight: "bold",
    color: "white",
  },
  arrowIcon: {
    right: 6,
    top: 2,
  },
});
