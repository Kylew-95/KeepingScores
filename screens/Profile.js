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
  StatusBar,
} from "react-native";
import { Avatar, IconButton } from "react-native-paper";
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
  const loadSavedHeader = useCallback(async () => {
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

  // Auto-refresh every time the profile tab is clicked / focused
  useEffect(() => {
    fetchStats();
    loadSavedHeader();

    if (navigation && typeof navigation.addListener === "function") {
      const unsubscribe = navigation.addListener("focus", () => {
        fetchStats();
        loadSavedHeader();
      });
      return unsubscribe;
    }
  }, [navigation, fetchStats, loadSavedHeader]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), loadSavedHeader()]);
    setRefreshing(false);
  };

  const fullName = `${profileData?.first_name || "Profile"} ${
    profileData?.last_name || ""
  }`.trim();

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ backgroundColor: "#F8FAFC" }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header Banner - Starts flush at top, no white space */}
        <View style={styles.bannerWrapper}>
          <Image
            style={styles.bannerImage}
            source={
              headerImageUrl
                ? { uri: headerImageUrl }
                : require("../Images/blue-mountains-foggy-mountain-range-landscape-scenery-5k-6016x3384-5939.jpg")
            }
          />

          {/* Floating Top Controls inside Banner */}
          <View style={styles.bannerTopBar}>
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

            {/* 3 Dots Button (Opens Account) */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Account")}
              style={styles.threeDotsBadge}
              activeOpacity={0.8}
            >
              <Avatar.Image
                style={{ backgroundColor: "transparent" }}
                size={22}
                source={require("../Images/3Dots.png")}
                tintColor="white"
              />
            </TouchableOpacity>
          </View>

          {/* Flawless Centered Profile Avatar Ring (no offset, no white crescent) */}
          <View style={styles.avatarOuterRing}>
            <View style={styles.avatarInnerCircle}>
              <Image
                style={styles.avatarImg}
                source={
                  profileData?.avatar_image_url
                    ? { uri: profileData.avatar_image_url }
                    : require("../Images/Logo-Keeping-Score.png")
                }
                resizeMode={profileData?.avatar_image_url ? "cover" : "contain"}
              />
            </View>
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

        {/* Health & Daily Goals Section (Measurements, Exercise, Sleep) */}
        <Dashboard />
      </ScrollView>

      {/* Friends & Followers Modal */}
      <FriendsListModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        currentUserId={resolvedUserId}
        onFollowChange={fetchStats}
        initialTab={friendsModalTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  bannerWrapper: {
    height: 200,
    width: "100%",
    position: "relative",
    backgroundColor: "#0F172A",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerTopBar: {
    position: "absolute",
    top: 44,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  editHeaderBadge: {
    backgroundColor: "rgba(0, 23, 31, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  editHeaderText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  threeDotsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 23, 31, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  avatarOuterRing: {
    position: "absolute",
    bottom: -52,
    alignSelf: "center",
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#FFFFFF",
    padding: 3,
    zIndex: 50,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  avatarInnerCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 51,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 51,
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
