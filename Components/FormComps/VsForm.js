import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import {
  Appbar,
  Card,
  Avatar,
  Button,
  TextInput,
  Chip,
  IconButton,
  Searchbar,
  ActivityIndicator,
} from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";
import { useNavigation } from "@react-navigation/native";

const POPULAR_SPORTS = [
  { name: "Badminton", icon: "badminton" },
  { name: "Tennis", icon: "tennis" },
  { name: "Football", icon: "soccer" },
  { name: "Basketball", icon: "basketball" },
  { name: "Pool", icon: "billiards" },
  { name: "Table Tennis", icon: "table-tennis" },
  { name: "Squash", icon: "racquetball" },
  { name: "Other", icon: "trophy" },
];

export default function VsForm({
  scoresData,
  setScoresData,
  profileData,
  userId,
  isEmbedded = false,
  onSaveSuccess,
}) {
  const navigation = useNavigation();

  // Match state
  const [sport, setSport] = useState("Badminton");
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [gameRound, setGameRound] = useState("1");
  const [location, setLocation] = useState("Local Court");
  const [submitting, setSubmitting] = useState(false);

  // Selected opponent state
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [customGuestName, setCustomGuestName] = useState("");

  const currentUserId = userId || profileData?.userprofile_id;
  const p1Name = profileData?.first_name || "You";
  const p1Avatar = profileData?.avatar_image_url;

  // Fetch followed friends and community users
  const loadOpponents = async () => {
    if (!currentUserId) return;
    setLoadingUsers(true);
    try {
      // 1. Fetch all user profiles
      const { data: profiles, error: profErr } = await supabase
        .from("UserProfileData")
        .select("*");
      if (profErr) throw profErr;

      const otherProfiles = (profiles || []).filter(
        (p) => p.userprofile_id !== currentUserId,
      );
      setAllUsers(otherProfiles);

      // 2. Fetch following list
      const { data: followings, error: folErr } = await supabase
        .from("UserFollows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      if (folErr) throw folErr;

      const followedIds = new Set(
        (followings || []).map((f) => f.following_id),
      );
      const followedFriends = otherProfiles.filter((p) =>
        followedIds.has(p.userprofile_id),
      );
      setFriends(followedFriends);

      // Default to first friend if not selected yet
      if (!selectedOpponent && followedFriends.length > 0) {
        setSelectedOpponent({
          name: followedFriends[0].first_name || "Friend",
          avatarUrl: followedFriends[0].avatar_image_url,
          userId: followedFriends[0].userprofile_id,
        });
      }
    } catch (err) {
      console.error("Error loading opponents:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadOpponents();
  }, [currentUserId]);

  const handleSelectOpponent = (user) => {
    setSelectedOpponent({
      name: user.first_name || "Player",
      avatarUrl: user.avatar_image_url,
      userId: user.userprofile_id,
    });
    setModalVisible(false);
  };

  const handleSelectGuest = () => {
    if (!customGuestName.trim()) {
      Alert.alert("Name required", "Please type opponent's name.");
      return;
    }
    setSelectedOpponent({
      name: customGuestName.trim(),
      avatarUrl: null,
      userId: null,
      isGuest: true,
    });
    setCustomGuestName("");
    setModalVisible(false);
  };

  const handleSaveMatch = async () => {
    if (!selectedOpponent || !selectedOpponent.name) {
      Alert.alert(
        "Missing Opponent",
        "Please select who you are playing against.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const matchRow = {
        ...(currentUserId ? { scores_id: currentUserId } : {}),
        location: location.trim() || "Local Court",
        activity: sport,
        gameRound: String(gameRound || "1"),
        players: [
          { player1: p1Name, scores: String(p1Score) },
          { player2: selectedOpponent.name, scores: String(p2Score) },
        ],
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };

      const { data, error } = await supabase
        .from("ScoresData")
        .upsert(matchRow)
        .select();

      if (error) throw error;

      if (data && Array.isArray(scoresData)) {
        setScoresData([data[0], ...scoresData]);
      }

      Alert.alert(
        "Match Saved! 🏆",
        `${p1Name} ${p1Score} - ${p2Score} ${selectedOpponent.name} has been recorded.`,
      );

      // Reset scores for next entry
      setP1Score(0);
      setP2Score(0);

      if (onSaveSuccess) {
        onSaveSuccess();
      } else if (!isEmbedded) {
        navigation.goBack();
      }
    } catch (err) {
      console.error("Error saving match:", err);
      Alert.alert("Error", err.message || "Failed to save match.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists for modal
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((u) => {
      const full = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      return full.includes(q);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isEmbedded && (
        <Appbar.Header style={{ backgroundColor: "#FFFFFF", elevation: 1 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content
            title="Log Match"
            titleStyle={{ fontWeight: "700" }}
          />
        </Appbar.Header>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerTitle}>⚡ Match Center</Text>
        <Text style={styles.headerSubtitle}>
          Who are you playing today? Log scores and boost your rank!
        </Text>

        {/* Matchup VS Card */}
        <Card style={styles.matchCard}>
          <View style={styles.matchupRow}>
            {/* Player 1 (User) */}
            <View style={styles.playerBox}>
              {p1Avatar ? (
                <Avatar.Image size={64} source={{ uri: p1Avatar }} />
              ) : (
                <Avatar.Text
                  size={64}
                  label={p1Name.substring(0, 2).toUpperCase()}
                  style={{ backgroundColor: "#2193F0" }}
                  labelStyle={{ color: "white", fontWeight: "bold" }}
                />
              )}
              <Text style={styles.playerNameText} numberOfLines={1}>
                {p1Name}
              </Text>
              <Text style={styles.playerLabel}>(You)</Text>

              {/* P1 Score Stepper */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setP1Score((prev) => Math.max(0, prev - 1))}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  value={String(p1Score)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    setP1Score(isNaN(num) ? 0 : num);
                  }}
                  keyboardType="numeric"
                  style={styles.scoreInput}
                  dense
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setP1Score((prev) => prev + 1)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* VS Badge */}
            <View style={styles.vsBadgeContainer}>
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <Text style={styles.roundBadge}>Rnd {gameRound}</Text>
            </View>

            {/* Player 2 (Friend / Opponent) */}
            <View style={styles.playerBox}>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.opponentSelectBtn}
                activeOpacity={0.8}
              >
                {selectedOpponent?.avatarUrl ? (
                  <Avatar.Image
                    size={64}
                    source={{ uri: selectedOpponent.avatarUrl }}
                  />
                ) : selectedOpponent?.name ? (
                  <Avatar.Text
                    size={64}
                    label={selectedOpponent.name.substring(0, 2).toUpperCase()}
                    style={{ backgroundColor: "#8B5CF6" }}
                    labelStyle={{ color: "white", fontWeight: "bold" }}
                  />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Text style={styles.plusSign}>+</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ alignItems: "center" }}
              >
                <Text style={styles.playerNameText} numberOfLines={1}>
                  {selectedOpponent ? selectedOpponent.name : "Select"}
                </Text>
                <Text style={styles.changeLabel}>
                  {selectedOpponent ? "Tap to change ▾" : "Tap to pick ▾"}
                </Text>
              </TouchableOpacity>

              {/* P2 Score Stepper */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setP2Score((prev) => Math.max(0, prev - 1))}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  value={String(p2Score)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    setP2Score(isNaN(num) ? 0 : num);
                  }}
                  keyboardType="numeric"
                  style={styles.scoreInput}
                  dense
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setP2Score((prev) => prev + 1)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Sport Selector */}
        <Text style={styles.sectionTitle}>Select Sport</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportsScroll}
        >
          {POPULAR_SPORTS.map((s) => (
            <Chip
              key={s.name}
              selected={sport === s.name}
              onPress={() => setSport(s.name)}
              style={[
                styles.sportChip,
                sport === s.name && styles.selectedSportChip,
              ]}
              textStyle={[
                styles.sportChipText,
                sport === s.name && styles.selectedSportChipText,
              ]}
              icon={s.icon}
            >
              {s.name}
            </Chip>
          ))}
        </ScrollView>

        {/* Match Details Section */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <View style={styles.detailRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Game Round</Text>
                <TextInput
                  value={String(gameRound)}
                  onChangeText={setGameRound}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.textInputStyle}
                  dense
                />
              </View>

              <View style={{ flex: 2, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Location / Venue</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  mode="outlined"
                  placeholder="e.g. Clapham Court"
                  style={styles.textInputStyle}
                  dense
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Submit Match Button */}
        <Button
          mode="contained"
          onPress={handleSaveMatch}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          contentStyle={{ height: 50 }}
          labelStyle={{ fontSize: 16, fontWeight: "700" }}
          icon="trophy-award"
        >
          Record Match Result
        </Button>
      </ScrollView>

      {/* Opponent Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Opponent</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setModalVisible(false)}
            />
          </View>

          <Searchbar
            placeholder="Search friend..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ minHeight: 0 }}
          />

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {/* Followed Friends Section */}
            <Text style={styles.modalSectionHeading}>
              ⭐ Your Friends ({friends.length})
            </Text>
            {friends.length === 0 ? (
              <Text style={styles.emptyNote}>
                You haven't followed any friends yet. Select a player below or
                add a guest name.
              </Text>
            ) : (
              filterList(friends).map((friend) => (
                <TouchableOpacity
                  key={friend.userprofile_id}
                  style={styles.opponentRow}
                  onPress={() => handleSelectOpponent(friend)}
                >
                  {friend.avatar_image_url ? (
                    <Avatar.Image
                      size={44}
                      source={{ uri: friend.avatar_image_url }}
                    />
                  ) : (
                    <Avatar.Text
                      size={44}
                      label={(friend.first_name || "F")
                        .substring(0, 2)
                        .toUpperCase()}
                      style={{ backgroundColor: "#2193F0" }}
                    />
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.opponentRowName}>
                      {friend.first_name} {friend.last_name || ""}
                    </Text>
                    <Text style={styles.friendBadge}>Friend</Text>
                  </View>
                  <Button mode="text" compact>
                    Select
                  </Button>
                </TouchableOpacity>
              ))
            )}

            {/* Other Community Players */}
            <Text style={[styles.modalSectionHeading, { marginTop: 20 }]}>
              👥 Other Players
            </Text>
            {filterList(
              allUsers.filter(
                (u) =>
                  !friends.some((f) => f.userprofile_id === u.userprofile_id),
              ),
            ).map((user) => (
              <TouchableOpacity
                key={user.userprofile_id}
                style={styles.opponentRow}
                onPress={() => handleSelectOpponent(user)}
              >
                {user.avatar_image_url ? (
                  <Avatar.Image
                    size={44}
                    source={{ uri: user.avatar_image_url }}
                  />
                ) : (
                  <Avatar.Text
                    size={44}
                    label={(user.first_name || "P")
                      .substring(0, 2)
                      .toUpperCase()}
                    style={{ backgroundColor: "#64748B" }}
                  />
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.opponentRowName}>
                    {user.first_name} {user.last_name || ""}
                  </Text>
                </View>
                <Button mode="text" compact>
                  Select
                </Button>
              </TouchableOpacity>
            ))}

            {/* Custom Guest Name */}
            <Text style={[styles.modalSectionHeading, { marginTop: 20 }]}>
              👤 Guest Opponent (Not on app)
            </Text>
            <View style={styles.guestRow}>
              <TextInput
                mode="outlined"
                placeholder="Enter guest name..."
                value={customGuestName}
                onChangeText={setCustomGuestName}
                style={{ flex: 1, backgroundColor: "white" }}
                dense
              />
              <Button
                mode="contained"
                onPress={handleSelectGuest}
                style={{ marginLeft: 8, backgroundColor: "#2193F0" }}
              >
                Add
              </Button>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 18,
  },
  matchupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerBox: {
    alignItems: "center",
    width: "40%",
  },
  playerNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
    textAlign: "center",
  },
  playerLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  changeLabel: {
    fontSize: 12,
    color: "#2193F0",
    fontWeight: "600",
  },
  opponentSelectBtn: {
    alignItems: "center",
  },
  placeholderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#2193F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
  },
  plusSign: {
    fontSize: 28,
    color: "#2193F0",
    fontWeight: "bold",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 1,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  scoreInput: {
    width: 44,
    height: 34,
    textAlign: "center",
    backgroundColor: "transparent",
    fontSize: 18,
    fontWeight: "800",
  },
  vsBadgeContainer: {
    alignItems: "center",
    width: "20%",
  },
  vsCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2193F0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  vsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  roundBadge: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  sportsScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  sportChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 6,
  },
  selectedSportChip: {
    backgroundColor: "#2193F0",
    borderColor: "#2193F0",
  },
  sportChipText: {
    color: "#334155",
    fontSize: 13,
  },
  selectedSportChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 20,
    elevation: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  textInputStyle: {
    backgroundColor: "#FFFFFF",
    height: 40,
  },
  submitButton: {
    backgroundColor: "#2193F0",
    borderRadius: 12,
    elevation: 3,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  searchbar: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    elevation: 1,
    borderRadius: 12,
    height: 44,
  },
  modalSectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
  },
  emptyNote: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 8,
  },
  opponentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    elevation: 1,
  },
  opponentRowName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  friendBadge: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
    marginTop: 2,
  },
  guestRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});
