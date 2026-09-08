import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Avatar, Appbar, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import SocialUserStats from "../Components/SocialUserStats";
import Dashboard from "../Components/Dashboard";
import FriendsListModal from "../Components/FriendsListModal";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function Profile({
  users,
  setUsers,
  profileData,
  setProfileData,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const navigation = useNavigation();

  const fetchStats = useCallback(async () => {
    if (!profileData?.userprofile_id) return;
    try {
      const [followingRes, followersRes, scoresRes] = await Promise.all([
        supabase
          .from("UserFollows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", profileData.userprofile_id),
        supabase
          .from("UserFollows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", profileData.userprofile_id),
        supabase.from("ScoresData").select("id, players"),
      ]);

      setFollowingCount(followingRes.count || 0);
      setFollowersCount(followersRes.count || 0);

      if (scoresRes.data) {
        const myName = (profileData.first_name || "").trim().toLowerCase();
        const myMatches = scoresRes.data.filter((s) => {
          const p1 = (s.players?.[0]?.player1 || "").trim().toLowerCase();
          const p2 = (s.players?.[1]?.player2 || "").trim().toLowerCase();
          return p1 === myName || p2 === myName;
        });
        setMatchesCount(myMatches.length);
      }
    } catch (err) {
      console.error("Error loading profile stats:", err);
    }
  }, [profileData?.userprofile_id, profileData?.first_name]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const fullName = `${profileData?.first_name || "Profile"} ${
    profileData?.last_name || ""
  }`.trim();

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
          <Text style={styles.headerUserName}>
            {profileData?.first_name || "Profile"}
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
            top: 38,
            right: 20,
            backgroundColor: "transparent",
          }}
        >
          <Avatar.Image
            style={{
              backgroundColor: "transparent",
            }}
            size={25}
            source={require("../Images/3Dots.png")}
            tintColor="white"
          />
        </TouchableOpacity>
      </Appbar>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
          {/* Header Banner */}
          <View style={{ height: 180, position: "relative" }}>
            <Image
              style={{
                position: "absolute",
                width: "100%",
                height: 180,
                resizeMode: "cover",
              }}
              source={require("../Images/blue-mountains-foggy-mountain-range-landscape-scenery-5k-6016x3384-5939.jpg")}
            />
            <View style={styles.avatarWrapper}>
              <Avatar.Image
                style={styles.avatar}
                size={100}
                source={
                  profileData?.avatar_image_url
                    ? { uri: profileData.avatar_image_url }
                    : require("../Images/Logo-Keeping-Score.png")
                }
              />
            </View>
          </View>

          {/* User Info & Stats Section */}
          <View style={styles.profileBody}>
            <Text style={styles.profileName}>{fullName}</Text>

            {/* Stats Row */}
            <View style={{ marginTop: 14 }}>
              <SocialUserStats
                matchesCount={matchesCount}
                followersCount={followersCount}
                followingCount={followingCount}
                onPressFriends={() => setShowFriendsModal(true)}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                icon="account-group"
                onPress={() => setShowFriendsModal(true)}
                style={styles.friendsBtn}
                labelStyle={{ fontWeight: "700" }}
              >
                Friends & Followers
              </Button>
            </View>
          </View>

          {/* Dashboard Section */}
          <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <Dashboard />
          </SafeAreaView>
        </SafeAreaView>
      </ScrollView>

      {/* Friends & Followers Modal */}
      <FriendsListModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        currentUserId={profileData?.userprofile_id}
        onFollowChange={fetchStats}
      />
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
  avatarWrapper: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    zIndex: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileBody: {
    marginTop: 56,
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
  },
  friendsBtn: {
    backgroundColor: "#2193F0",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
});
