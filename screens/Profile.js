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
import { TopProfileTabBar } from "../Navigation/TopProfileTabBar";
import Dashboard from "../Components/Dashboard";
export default function Profile({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  return (
    <>
      <Appbar
        style={{
          position: "absolute",
          width: "100%",
          backgroundColor: "#2193F0",
          zIndex: 300,
          height: 80,
        }}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={() => navigation.navigate("Account")}
        >
          <Text style={styles.headerUserName}>{profileData.first_name}</Text>
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
            top: 38,
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
      </Appbar>
      <ScrollView>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "white", height: "100%" }}
        >
          <Appbar.Header style={{ height: 150, zIndex: 20 }}>
            <Image
              style={{
                position: "absolute",
                resizeMode: "cover",
                width: 500,
                height: 300,
                top: -50,
                marginLeft: -20,
                zIndex: -10,
                backgroundColor: "transparent",
              }}
              source={require("../Images/blue-mountains-foggy-mountain-range-landscape-scenery-5k-6016x3384-5939.jpg")}
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
            ></View>
            <Avatar.Image
              style={{
                position: "absolute",
                zIndex: 200,
                top: 100,
                left: 150,
                backgroundColor: "transparent",
                alignSelf: "center",
              }}
              size={100}
              source={{
                uri: profileData.avatar_image_url,
              }}
            />
            {/* 
          <View style={{ top: -70 }}> */}

            {/* </View> */}
          </Appbar.Header>

          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "white",
              top: 100,
              zIndex: 30,
              height: "100%",
            }}
          >
            <Dashboard />
          </SafeAreaView>
        </SafeAreaView>
      </ScrollView>
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
    top: 8,
    fontWeight: "bold",
    color: "white",
  },
  arrowIcon: {
    right: 6,
    top: 8,
  },
});
