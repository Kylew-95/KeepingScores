import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { Avatar, IconButton, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../SupabaseConfig/SupabaseClient";

const SPORT_ICONS = {
  Badminton: "🏸",
  Tennis: "🎾",
  Football: "⚽",
  Basketball: "🏀",
  Pool: "🎱",
  "Table Tennis": "🏓",
  Squash: "🥊",
  Other: "🏆",
};

export default function ProfileMatchScores({
  profileData,
  currentUserId,
  onScoresCountChange,
}) {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allMatchesModalVisible, setAllMatchesModalVisible] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ScoresData")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data) {
        const myName = (profileData?.first_name || "").trim().toLowerCase();
        const myMatches = data.filter((s) => {
          if (currentUserId && (s.scores_id || s.user_id)) {
            return s.scores_id === currentUserId || s.user_id === currentUserId;
          }
          if (!currentUserId && myName) {
            const p1 = (s.players?.[0]?.player1 || "").trim().toLowerCase();
            const p2 = (s.players?.[1]?.player2 || "").trim().toLowerCase();
            return p1 === myName || p2 === myName;
          }
          return false;
        });

        setMatches(myMatches);
        if (onScoresCountChange) {
          onScoresCountChange(myMatches.length);
        }
      }
    } catch (err) {
      console.error("Error loading profile matches:", err);
    } finally {
      setLoading(false);
    }
  }, [profileData?.first_name, currentUserId, onScoresCountChange]);

  useEffect(() => {
    fetchMatches();

    if (navigation && typeof navigation.addListener === "function") {
      const unsubscribe = navigation.addListener("focus", () => {
        fetchMatches();
      });
      return unsubscribe;
    }
  }, [navigation, fetchMatches]);

  const handleDeleteScore = (scoreId, p1, p2) => {
    Alert.alert(
      "Delete Match",
      `Are you sure you want to delete the match between ${p1} and ${p2}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("ScoresData")
                .delete()
                .match({ id: scoreId });

              if (error) {
                Alert.alert("Error", error.message);
              } else {
                setMatches((prev) => prev.filter((m) => m.id !== scoreId));
              }
            } catch (e) {
              console.error("Error deleting match:", e);
            }
          },
        },
      ],
    );
  };

  const parseMatch = (item) => {
    if (!item) return null;
    const players = item.players || [];
    const p1 = players[0]?.player1 || "Player 1";
    const s1 = parseFloat(players[0]?.scores) || 0;
    const p2 = players[1]?.player2 || "Player 2";
    const s2 = parseFloat(players[1]?.scores) || 0;

    const myName = (profileData?.first_name || "").trim().toLowerCase();
    const isP1Me = p1.trim().toLowerCase() === myName;
    const myScore = isP1Me ? s1 : s2;
    const oppScore = isP1Me ? s2 : s1;
    const oppName = isP1Me ? p2 : p1;

    let outcome = "DRAW";
    let outcomeColor = "#EAB308";
    if (myScore > oppScore) {
      outcome = "WIN";
      outcomeColor = "#10B981";
    } else if (myScore < oppScore) {
      outcome = "LOSS";
      outcomeColor = "#EF4444";
    }

    const sportEmoji = SPORT_ICONS[item.activity] || "🏅";

    return {
      p1,
      s1,
      p2,
      s2,
      oppName,
      myScore,
      oppScore,
      outcome,
      outcomeColor,
      sportEmoji,
      activity: item.activity || "Match",
      location: item.location || "Sports Venue",
      date: item.date || "",
    };
  };

  const renderTriangleCard = (item, isBottomCentered = false) => {
    if (!item) return null;
    const m = parseMatch(item);
    if (!m) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setAllMatchesModalVisible(true)}
        style={[
          styles.triangleCard,
          isBottomCentered && styles.triangleCardBottom,
        ]}
      >
        <View
          style={[styles.cardOutcomeBadge, { backgroundColor: m.outcomeColor }]}
        >
          <Text style={styles.cardOutcomeText}>{m.outcome}</Text>
        </View>

        <Text style={styles.cardSportText}>
          {m.sportEmoji} {m.activity}
        </Text>

        <View style={styles.cardScoreRow}>
          <Text style={[styles.cardScoreNumber, { color: m.outcomeColor }]}>
            {m.myScore}
          </Text>
          <Text style={styles.cardScoreHyphen}>-</Text>
          <Text style={styles.cardScoreNumberOpp}>{m.oppScore}</Text>
        </View>

        <Text style={styles.cardOpponentText} numberOfLines={1}>
          vs {m.oppName}
        </Text>
        <Text style={styles.cardLocationText} numberOfLines={1}>
          📍 {m.location}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFullMatchItem = ({ item }) => {
    const m = parseMatch(item);
    if (!m) return null;

    const p1Won = m.s1 > m.s2;
    const p2Won = m.s2 > m.s1;

    return (
      <View style={styles.fullCard}>
        <View style={styles.fullHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fullLocationText} numberOfLines={1}>
              📍 {item.location || "Sports Center"}
            </Text>
            <Text style={styles.fullDateText}>
              {item.date} {item.time ? `• ${item.time}` : ""}
            </Text>
          </View>
          <View style={styles.fullSportBadge}>
            <Text style={styles.fullSportBadgeText}>
              {m.sportEmoji} {item.activity || "Match"}
            </Text>
          </View>
        </View>

        <View style={styles.fullScoreBanner}>
          <View style={styles.fullPlayerBox}>
            <Avatar.Text
              size={36}
              label={m.p1.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: p1Won ? "#10B981" : "#0284C7" }}
              labelStyle={{ fontWeight: "bold", fontSize: 13 }}
            />
            <Text
              style={[
                styles.fullPlayerName,
                p1Won && { color: "#10B981", fontWeight: "bold" },
              ]}
              numberOfLines={1}
            >
              {m.p1}
            </Text>
            <Text style={[styles.fullScoreNum, p1Won && { color: "#10B981" }]}>
              {m.s1}
            </Text>
          </View>

          <View style={styles.fullVsBox}>
            <Text style={styles.fullVsText}>VS</Text>
            <Text style={styles.fullRoundText}>
              Round {item.gameRound || "1"}
            </Text>
          </View>

          <View style={styles.fullPlayerBox}>
            <Avatar.Text
              size={36}
              label={m.p2.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: p2Won ? "#10B981" : "#64748B" }}
              labelStyle={{ fontWeight: "bold", fontSize: 13 }}
            />
            <Text
              style={[
                styles.fullPlayerName,
                p2Won && { color: "#10B981", fontWeight: "bold" },
              ]}
              numberOfLines={1}
            >
              {m.p2}
            </Text>
            <Text style={[styles.fullScoreNum, p2Won && { color: "#10B981" }]}>
              {m.s2}
            </Text>
          </View>
        </View>

        <View style={styles.fullFooterRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteScore(item.id, m.p1, m.p2)}
          >
            <IconButton
              icon="trash-can-outline"
              iconColor="#EF4444"
              size={18}
              style={{ margin: 0 }}
            />
            <Text style={styles.deleteBtnText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={24} color="#2193F0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        {matches.length > 0 && (
          <TouchableOpacity onPress={() => setAllMatchesModalVisible(true)}>
            <Text style={styles.viewAllText}>
              View All ({matches.length}) →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏅</Text>
          <Text style={styles.emptyTitle}>No matches recorded yet</Text>
          <Text style={styles.emptySubtext}>
            Scores you record will display here in your profile.
          </Text>
        </View>
      ) : (
        <View style={styles.triangleContainer}>
          <View style={styles.topRow}>
            <View style={styles.topCardWrapper}>
              {renderTriangleCard(matches[0])}
            </View>
            {matches[1] ? (
              <View style={styles.topCardWrapper}>
                {renderTriangleCard(matches[1])}
              </View>
            ) : (
              <View style={[styles.topCardWrapper, styles.placeholderCard]} />
            )}
          </View>

          {matches[2] && (
            <View style={styles.bottomRow}>
              {renderTriangleCard(matches[2], true)}
            </View>
          )}

          <TouchableOpacity
            style={styles.openAllBtn}
            onPress={() => setAllMatchesModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.openAllBtnText}>
              📊 View Full Game History ({matches.length} matches)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={allMatchesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAllMatchesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Match & Game History</Text>
            <TouchableOpacity onPress={() => setAllMatchesModalVisible(false)}>
              <IconButton
                icon="close"
                size={24}
                iconColor="#0F172A"
                style={{ margin: 0 }}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={matches}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderFullMatchItem}
            contentContainerStyle={styles.modalListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No matches found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2193F0",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  triangleContainer: {
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  topCardWrapper: {
    flex: 1,
  },
  bottomRow: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  triangleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: "relative",
  },
  triangleCardBottom: {
    width: CARD_WIDTH + 24,
  },
  placeholderCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 14,
    height: 110,
  },
  cardOutcomeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardOutcomeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cardSportText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 4,
  },
  cardScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  cardScoreNumber: {
    fontSize: 22,
    fontWeight: "900",
  },
  cardScoreHyphen: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94A3B8",
    marginHorizontal: 4,
  },
  cardScoreNumberOpp: {
    fontSize: 20,
    fontWeight: "700",
    color: "#64748B",
  },
  cardOpponentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  cardLocationText: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  openAllBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 14,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  openAllBtnText: {
    color: "#2193F0",
    fontSize: 13,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  modalListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  fullCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  fullHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fullLocationText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  fullDateText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  fullSportBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fullSportBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  fullScoreBanner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fullPlayerBox: {
    alignItems: "center",
    flex: 1,
  },
  fullPlayerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 4,
  },
  fullScoreNum: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2,
  },
  fullVsBox: {
    alignItems: "center",
  },
  fullVsText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
  },
  fullRoundText: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
  fullFooterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
});
