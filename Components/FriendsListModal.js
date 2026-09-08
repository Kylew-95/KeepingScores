import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import {
  Avatar,
  Button,
  Searchbar,
  SegmentedButtons,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { supabase } from "../SupabaseConfig/SupabaseClient";

export default function FriendsListModal({
  visible,
  onClose,
  currentUserId,
  onFollowChange,
}) {
  const [tab, setTab] = useState("following"); // 'following' | 'followers' | 'discover'
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());

  const loadData = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      // 1. Fetch all user profiles
      const { data: profiles, error: profErr } = await supabase
        .from("UserProfileData")
        .select("*");

      if (profErr) throw profErr;

      // Filter out self for discovery
      const others = (profiles || []).filter(
        (p) => p.userprofile_id !== currentUserId,
      );
      setAllUsers(others);

      // 2. Fetch following
      const { data: followingsData, error: folErr } = await supabase
        .from("UserFollows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      if (folErr) throw folErr;

      const followedIdSet = new Set(
        (followingsData || []).map((f) => f.following_id),
      );
      setFollowingIds(followedIdSet);

      const followingProfiles = (profiles || []).filter((p) =>
        followedIdSet.has(p.userprofile_id),
      );
      setFollowing(followingProfiles);

      // 3. Fetch followers
      const { data: followersData, error: fldErr } = await supabase
        .from("UserFollows")
        .select("follower_id")
        .eq("following_id", currentUserId);

      if (fldErr) throw fldErr;

      const followerIdSet = new Set(
        (followersData || []).map((f) => f.follower_id),
      );
      const followerProfiles = (profiles || []).filter((p) =>
        followerIdSet.has(p.userprofile_id),
      );
      setFollowers(followerProfiles);
    } catch (err) {
      console.error("Error loading friends/follow data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFollow = async (targetUserId) => {
    const isCurrentlyFollowing = followingIds.has(targetUserId);

    // Optimistic UI update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) {
        next.delete(targetUserId);
      } else {
        next.add(targetUserId);
      }
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("UserFollows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("UserFollows").insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        });
        if (error) throw error;
      }

      if (onFollowChange) {
        onFollowChange();
      }
    } catch (err) {
      console.error("Error updating follow state:", err);
      // Revert optimistic update on error
      loadData();
    }
  };

  const getDisplayedUsers = () => {
    let list = [];
    if (tab === "following") {
      list = following;
    } else if (tab === "followers") {
      list = followers;
    } else {
      list = allUsers;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((u) => {
        const fullName =
          `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    return list;
  };

  const renderUserItem = ({ item }) => {
    const isFollowing = followingIds.has(item.userprofile_id);
    const fullName =
      `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Player";

    return (
      <View style={styles.userRow}>
        {item.avatar_image_url ? (
          <Avatar.Image size={48} source={{ uri: item.avatar_image_url }} />
        ) : (
          <Avatar.Text
            size={48}
            label={fullName.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: "#2193F0" }}
            labelStyle={{ color: "white", fontWeight: "bold" }}
          />
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userSubtext}>
            {isFollowing ? "Following" : "Not following"}
          </Text>
        </View>

        {item.userprofile_id !== currentUserId && (
          <Button
            mode={isFollowing ? "outlined" : "contained"}
            onPress={() => handleToggleFollow(item.userprofile_id)}
            style={[
              styles.followButton,
              isFollowing ? styles.followingBtn : styles.followBtn,
            ]}
            labelStyle={[
              styles.followBtnText,
              isFollowing ? { color: "#64748B" } : { color: "#FFFFFF" },
            ]}
            compact
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends & Followers</Text>
          <IconButton icon="close" size={24} onPress={onClose} />
        </View>

        {/* Tab Selection */}
        <View style={styles.segmentedWrapper}>
          <SegmentedButtons
            value={tab}
            onValueChange={setTab}
            buttons={[
              {
                value: "following",
                label: `Following (${following.length})`,
              },
              {
                value: "followers",
                label: `Followers (${followers.length})`,
              },
              {
                value: "discover",
                label: "Find",
              },
            ]}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search by name..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ minHeight: 0 }}
        />

        {/* User List */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2193F0" />
          </View>
        ) : (
          <FlatList
            data={getDisplayedUsers()}
            keyExtractor={(item) => item.userprofile_id || String(item.id)}
            renderItem={renderUserItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Text style={styles.emptyText}>
                  {tab === "following"
                    ? "You haven't followed any players yet.\nSwitch to 'Find' to discover friends!"
                    : tab === "followers"
                      ? "No followers yet.\nShare your profile with friends!"
                      : "No players found."}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  segmentedWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 1,
    height: 44,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  userSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  followButton: {
    borderRadius: 20,
    minWidth: 95,
  },
  followBtn: {
    backgroundColor: "#2193F0",
  },
  followingBtn: {
    borderColor: "#CBD5E1",
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyView: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
});
