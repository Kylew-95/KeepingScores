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
import { Avatar, Appbar, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SocialUserStats from "../Components/SocialUserStats";
import ProfileMatchScores from "../Components/ProfileMatchScores";
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
  const [friendsModalTab, setFriendsModalTab] = useState("following");
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [resolvedUserId, setResolvedUserId] = useState(profileData?.userprofile_id);
  const [headerImageUrl, setHeaderImageUrl] = useState(profileData?.header_image_url || null);
  const navigation = useNavigation();

  // Load persistent header image if available
  useEffect(() => {
    async function loadSavedHeader() {
      try {
        const saved = await AsyncStorage.getItem("user_header_image_url");
        if (saved) {
          setHeaderImageUrl(saved);
        } else if (profileData?.header_image_url) {
          setHeaderImageUrl(profileData.header_image_url);
        }
      } catch (e) {
        // Ignored
      }
    }
    loadSavedHeader();
  }, [profileData?.header_image_url]);

  const fetchStats = useCallback(async () => {
    try {
      let uid = profileData?.userprofile_id;
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        uid = authData.user.id;
      }
      setResolvedUserId(uid);

      if (uid) {
        const [followingRes, followersRes] = await Promise.all([
          supabase
            .from("UserFollows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", uid),
          supabase
            .from("UserFollows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", uid),
        ]);

        setFollowingCount(followingRes.count || 0);
        setFollowersCount(followersRes.count || 0);
      }
    } catch (err) {
      console.error("Error loading profile stats:", err);
    }
  }, [profileData?.userprofile_id]);

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
      {/* Sleek Top Appbar - Only 3 dots on top right linking to Account */}
      <Appbar style={styles.topAppbar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => navigation.navigate("Account")}
          style={styles.threeDotsBtn}
          activeOpacity={0.7}
        >
          <Avatar.Image
            style={{ backgroundColor: "transparent" }}
            size={24}
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
          {/* Header Banner with customizable background image */}
          <View style={styles.bannerWrapper}>
            <Image
              style={styles.bannerImage}
              source={
                headerImageUrl
                  ? { uri: headerImageUrl }
                  : require("../Images/blue-mountains-foggy-mountain-range-landscape-scenery-5k-6016x3384-5939.jpg")
              }
            />

            {/* Quick Edit Header Button */}
            <TouchableOpacity
              style={styles.editHeaderBadge}
              onPress={() => navigation.navigate("Account")}
              activeOpacity={0.8}
            >
              <IconButton
                icon="camera"
                iconColor="#FFFFFF"
                size={14}
                style={{ margin: 0, marginRight: 2 }}
              />
              <Text style={styles.editHeaderText}>Edit Header</Text>
            </TouchableOpacity>

            {/* Profile Avatar */}
            <View style={styles.avatarWrapper}>
              <Avatar.Image
                style={styles.avatar}
                size={104}
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

            {/* Social Stats Row: Matches, Followers, Following */}
            <View style={styles.statsWrapper}>
              <SocialUserStats
                matchesCount={matchesCount}
                followersCount={followersCount}
                followingCount={followingCount}
                onPressFriends={(selectedTab) => {
                  setFriendsModalTab(selectedTab || "following");
                  setShowFriendsModal(true);
                }}
              />
            </View>
          </View>

          {/* User's Match Scores (Downwards Triangle Formation) */}
          <ProfileMatchScores
            profileData={profileData}
            currentUserId={resolvedUserId}
            onScoresCountChange={setMatchesCount}
          />

          {/* Health & Daily Goals Section (Measurements, Exercise, Sleep untouched) */}
          <Dashboard />
        </SafeAreaView>
      </ScrollView>

      {/* Friends & Followers Modal */}
      <FriendsListModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        currentUserId={resolvedUserId}
        onFollowChange={fetchStats}
        initialTab={friendsModalTab}
      />
    </>
  );
}

const styles = StyleSheet.create({
  topAppbar: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#2193F0",
    zIndex: 300,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  threeDotsBtn: {
    padding: 8,
    marginTop: 18,
  },
  bannerWrapper: {
    height: 190,
    position: "relative",
    backgroundColor: "#CBD5E1",
  },
  bannerImage: {
    position: "absolute",
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },
  editHeaderBadge: {
    position: "absolute",
    top: 80,
    right: 14,
    backgroundColor: "rgba(0, 23, 31, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 20,
  },
  editHeaderText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -52,
    alignSelf: "center",
    zIndex: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  avatar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3.5,
    borderColor: "#FFFFFF",
  },
  profileBody: {
    marginTop: 58,
    alignItems: "center",
    width: "100%",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  statsWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
});
