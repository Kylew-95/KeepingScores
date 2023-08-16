import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar, Divider, List, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../SupabaseConfig/SupabaseClient";

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

  const SignOut = async () => {
    console.log("SecureStore cleared successfully");
    await supabase.auth.signOut({ redirectTo: "Login" });
    navigation.replace("Login");
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
          <List.Section key={item.id} style={{ width: "70%", top: 100 }}>
            <List.Item
              key={item.id}
              titleStyle={item.colour === "red" ? { color: "red" } : null}
              title={item.title}
              onPress={() => {
                if (item.title === "Logout") {
                  SignOut();
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
    width: "50%",
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
    marginTop: 50,
  },
  searchbar: {
    width: "70%",
    backgroundColor: "black",
    borderRadius: 6,
    height: 45,
  },
});
