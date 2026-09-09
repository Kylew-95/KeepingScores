import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { Appbar, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import UpdateAvatarImage from "../../Components/UpdateAvatarImage";
import UpdateMetaData from "../../Components/UpdateMetaData";
import UpdateHeaderImage from "../../Components/UpdateHeaderImage";

export default function Account({
  profileData,
  setProfileData,
  session,
  setSession,
}) {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error("Error logging out:", error.message);
                Alert.alert("Logout Error", error.message);
              } else {
                if (setSession) setSession(null);
                if (setProfileData) setProfileData(null);
                if (navigation.reset) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                } else {
                  navigation.navigate("Login");
                }
              }
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: "#2193F0" }}>
        <Appbar.BackAction
          color="white"
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Profile");
            }
          }}
        />
        <Appbar.Content color="white" title="Account Settings" />
      </Appbar.Header>

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text style={styles.stettingsHeader}>Update Profile Picture</Text>
          <UpdateAvatarImage
            profileData={profileData}
            setProfileData={setProfileData}
            session={session}
          />

          <Text style={styles.stettingsHeader}>Update Header Background</Text>
          <UpdateHeaderImage
            profileData={profileData}
            setProfileData={setProfileData}
            session={session}
          />

          <Text style={styles.stettingsHeader}>Update Name</Text>
          <UpdateMetaData
            profileData={profileData}
            setProfileData={setProfileData}
            session={session}
          />
        </ScrollView>

        {/* Pinned Bottom Container with Round Log Out Button */}
        <View style={styles.bottomFooter}>
          <TouchableOpacity
            style={styles.logoutTouchable}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityLabel="Log Out"
          >
            <View style={styles.roundLogoutButton}>
              <IconButton
                icon="logout"
                iconColor="#FFFFFF"
                size={28}
                style={{ margin: 0 }}
              />
            </View>
            <Text style={styles.logoutLabel}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  stettingsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
  },
  bottomFooter: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  logoutTouchable: {
    alignItems: "center",
    justifyContent: "center",
  },
  roundLogoutButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
  },
  logoutLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 0.3,
  },
});
