import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar, Divider, List, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import { ExpoSecureStoreAdapter } from "../SupabaseConfig/SupabaseClient";

export default function Settings() {
  const navigation = useNavigation();

  const settingsTabs = [
    {
      id: 1,
      title: "Account",
      iconName: "account",
      iconArrow: "chevron-right",
    },
    {
      id: 2,
      title: "Notifications",
      iconName: "bell",
      iconArrow: "chevron-right",
    },
    { id: 3, title: "Privacy", iconName: "lock", iconArrow: "chevron-right" },
    {
      id: 4,
      title: "Help",
      iconName: "help-circle",
      iconArrow: "chevron-right",
    },
    {
      id: 5,
      title: "About",
      iconName: "information",
      iconArrow: "chevron-right",
    },
    { id: 6, title: "Logout", iconName: "logout", colour: "red" },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
      } else {
        console.log("Logged out successfully");
        await ExpoSecureStoreAdapter.removeItem();
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: "#2193F0" }}>
        <Appbar.BackAction
          color="white"
          onPress={() => navigation.navigate("Profile")}
        />
        <Appbar.Content color="white" title="Settings" />
      </Appbar.Header>
      <View style={styles.Container}>
        <View style={styles.searchbarContainer} />
        <Searchbar
          mode="bar"
          inputStyle={{ color: "white" }}
          style={styles.searchbar}
          placeholder="Search"
          placeholderTextColor={"white"}
          iconColor="white"
        />
        {settingsTabs.map((item) => (
          <List.Section
            key={item.id}
            style={{ width: "80%", top: 50, alignSelf: "center" }}
          >
            <List.Item
              key={item.id}
              titleStyle={item.colour === "red" ? { color: "red" } : null}
              title={item.title}
              onPress={() => {
                if (item.title === "Logout") {
                  handleLogout();
                } else {
                  navigation.navigate(item.title);
                }
              }}
              left={() => (
                <List.Icon
                  icon={item.iconName}
                  color={item.colour === "red" ? { color: "red" } : undefined}
                />
              )}
              right={() => <List.Icon icon={item.iconArrow} />}
            />
          </List.Section>
        ))}
      </View>
    </>
  );
}

styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    backgroundColor: "white",
    height: "100%",
    width: "100%",
  },
  tab: {
    color: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
  },
  dividerStyle: {
    backgroundColor: "black",
    height: 1,
    width: "80%",
    marginBottom: -10,
    alignSelf: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "400",
    color: "black",
    alignSelf: "center",
    marginTop: 10,
  },
  searchbarContainer: {
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  searchbar: {
    width: "70%",
    backgroundColor: "#00171F",
    borderRadius: 6,
    height: 50,
  },
});
