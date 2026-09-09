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
  initialTab = "following",
}) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (visible && initialTab) {
      setTab(initialTab);
    }
  }, [visible, initialTab]);
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
      // 1. Fetch profiles and leaderboard players
      const [profilesRes, leaderboardRes, followingRes, followersRes] = await Promise.all([
        supabase.from("UserProfileData").select("*"),
        supabase.from("GlobalLeaderboard").select("player_name, userprofile_id, avatar_image_url"),
        supabase.from("UserFollows").select("id, following_id, following_name").eq("follower_id", currentUserId),
        supabase.from("UserFollows").select("id, follower_id, following_name").eq("following_id", currentUserId),
      ]);

      const profiles = profilesRes.data || [];
      const leaderboard = leaderboardRes.data || [];
      const followingsData = followingRes.data || [];
      const followersData = followersRes.data || [];

      // Create lookup maps by userprofile_id and by lowercase name
      const profileById = new Map();
      const profileByName = new Map();

      profiles.forEach((p) => {
        if (p.userprofile_id) profileById.set(p.userprofile_id, p);
        if (p.first_name) profileByName.set(p.first_name.trim().toLowerCase(), p);
      });

      leaderboard.forEach((lb) => {
        const nameKey = (lb.player_name || "").trim().toLowerCase();
        if (lb.userprofile_id && !profileById.has(lb.userprofile_id)) {
          profileById.set(lb.userprofile_id, {
            userprofile_id: lb.userprofile_id,
            first_name: lb.player_name,
            last_name: "",
            avatar_image_url: lb.avatar_image_url,
          });
        }
        if (nameKey && !profileByName.has(nameKey)) {
          profileByName.set(nameKey, {
            userprofile_id: lb.userprofile_id || `lb-${lb.player_name}`,
            first_name: lb.player_name,
            last_name: "",
            avatar_image_url: lb.avatar_image_url,
          });
        }
      });

      // 2. Build Following List
      const followedIdSet = new Set();
      const followedNameSet = new Set();
      const followingList = [];

      followingsData.forEach((row) => {
        if (row.following_id) followedIdSet.add(row.following_id);
        // Only add to followedNameSet if it is an unlinked follow (no following_id)
        if (row.following_name && !row.following_id) {
          followedNameSet.add(row.following_name.trim().toLowerCase());
        }

        let matched = null;
        if (row.following_id && profileById.has(row.following_id)) {
          matched = { ...profileById.get(row.following_id), followRowId: row.id };
        } else if (!row.following_id && row.following_name && profileByName.has(row.following_name.trim().toLowerCase())) {
          matched = { ...profileByName.get(row.following_name.trim().toLowerCase()), followRowId: row.id };
        } else {
          matched = {
            userprofile_id: row.following_id || `follow-name-${row.id}`,
            first_name: row.following_name || "Friend",
            last_name: "",
            avatar_image_url: null,
            followRowId: row.id,
          };
        }

        followingList.push(matched);
      });

      setFollowingIds(followedIdSet);
      setFollowing(followingList);

      // 3. Build Followers List
      const followerList = [];
      followersData.forEach((row) => {
        let matched = null;
        if (row.follower_id && profileById.has(row.follower_id)) {
          matched = profileById.get(row.follower_id);
        } else {
          matched = {
            userprofile_id: row.follower_id || `follower-${row.id}`,
            first_name: "Follower",
            last_name: "",
            avatar_image_url: null,
          };
        }
        followerList.push(matched);
      });
      setFollowers(followerList);

      // 4. Build Discover List (excluding self)
      const discoverList = [];
      const seenDiscoverIds = new Set([currentUserId]);

      profiles.forEach((p) => {
        if (p.userprofile_id && !seenDiscoverIds.has(p.userprofile_id)) {
          seenDiscoverIds.add(p.userprofile_id);
          discoverList.push(p);
        }
      });

      leaderboard.forEach((lb) => {
        const idKey = lb.userprofile_id || `lb-${lb.player_name}`;
        if (!seenDiscoverIds.has(idKey)) {
          seenDiscoverIds.add(idKey);
          discoverList.push({
            userprofile_id: idKey,
            first_name: lb.player_name,
            last_name: "",
            avatar_image_url: lb.avatar_image_url,
          });
        }
      });

      setAllUsers(discoverList);
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

    const handleToggleFollow = async (userItem) => {
    const targetUserId = typeof userItem === "object" ? userItem.userprofile_id : userItem;
    const targetName = typeof userItem === "object" ? userItem.first_name : null;
    let followRowId = typeof userItem === "object" ? userItem.followRowId : null;

    // Look up followRowId from following list if not present
    if (!followRowId && targetUserId) {
      const found = following.find((f) => f.userprofile_id === targetUserId);
      if (found?.followRowId) followRowId = found.followRowId;
    }

    const isRealUser = targetUserId && !String(targetUserId).startsWith("follow-name-") && !String(targetUserId).startsWith("lb-");
    const isCurrentlyFollowing = isRealUser
      ? followingIds.has(targetUserId) || following.some((f) => f.userprofile_id === targetUserId)
      : following.some(
          (f) =>
            f.followRowId === followRowId ||
            (targetName && f.first_name?.toLowerCase() === targetName?.toLowerCase() && !f.following_id)
        );

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        if (followRowId) {
          await supabase.from("UserFollows").delete().eq("id", followRowId);
        }
        if (isRealUser) {
          await supabase
            .from("UserFollows")
            .delete()
            .eq("follower_id", currentUserId)
            .eq("following_id", targetUserId);
        } else if (targetName) {
          await supabase
            .from("UserFollows")
            .delete()
            .eq("follower_id", currentUserId)
            .ilike("following_name", targetName.trim());
        }
      } else {
        // Follow
        const insertPayload = {
          follower_id: currentUserId,
          following_id: isRealUser ? targetUserId : null,
          following_name: targetName || "Friend",
        };
        await supabase.from("UserFollows").insert(insertPayload);
      }

      await loadData();
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (err) {
      console.error("Error updating follow state:", err);
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
    const isRealUser = item.userprofile_id && !String(item.userprofile_id).startsWith("follow-name-") && !String(item.userprofile_id).startsWith("lb-");
    const isFollowing = isRealUser
      ? followingIds.has(item.userprofile_id) || following.some((f) => f.userprofile_id === item.userprofile_id)
      : following.some(
          (f) =>
            f.followRowId === item.followRowId ||
            (item.first_name && f.first_name?.toLowerCase() === item.first_name?.toLowerCase() && !f.following_id)
        );
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
            onPress={() => handleToggleFollow(item)}
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
