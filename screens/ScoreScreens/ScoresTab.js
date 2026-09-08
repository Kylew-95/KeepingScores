import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Card,
  Avatar,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";

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

export default function ScoresTab({
  scoresData: propScoresData,
  setScoresData: propSetScoresData,
}) {
  const [localScoresData, setLocalScoresData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(
    !propScoresData || propScoresData.length === 0,
  );

  const scoresData = propScoresData || localScoresData;
  const setScoresData = propSetScoresData || setLocalScoresData;

  async function fetchScores() {
    try {
      let fetchedData = await supabase
        .from("ScoresData")
        .select("*")
        .order("id", { ascending: false });
      if (fetchedData.data) {
        setScoresData(fetchedData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScores();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScores();
    setRefreshing(false);
  };

  const handleDeleteScore = (scoreId, p1, p2) => {
    Alert.alert(
      "Delete Match",
      `Are you sure you want to delete this match record between ${p1} and ${p2}?`,
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
                setScoresData(scoresData.filter((item) => item.id !== scoreId));
              }
            } catch (err) {
              console.error("Error deleting match:", err);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    if (!item) return null;

    const players = item.players || [];
    const p1 = players[0]?.player1 || "Player 1";
    const s1 = parseFloat(players[0]?.scores) || 0;
    const p2 = players[1]?.player2 || "Player 2";
    const s2 = parseFloat(players[1]?.scores) || 0;

    const p1Won = s1 > s2;
    const p2Won = s2 > s1;
    const isDraw = s1 === s2;

    const sportEmoji = SPORT_ICONS[item.activity] || "🏅";

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Header: Location & Sport Badge */}
          <View style={styles.headerRow}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                📍 {item.location || "Local Court"}
              </Text>
              <Text style={styles.dateTimeText}>
                {item.date} {item.time ? `• ${item.time}` : ""}
              </Text>
            </View>

            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>
                {sportEmoji} {item.activity || "Match"}
              </Text>
            </View>
          </View>

          {/* Match Score Banner */}
          <View style={styles.scoreBanner}>
            {/* Player 1 */}
            <View style={styles.playerBox}>
              <Avatar.Text
                size={40}
                label={p1.substring(0, 2).toUpperCase()}
                style={[styles.avatar, p1Won && styles.winnerAvatar]}
                labelStyle={{ fontWeight: "700", color: "white", fontSize: 14 }}
              />
              <Text
                style={[styles.playerName, p1Won && styles.winnerText]}
                numberOfLines={1}
              >
                {p1}
              </Text>
              <Text style={[styles.scoreNumber, p1Won && styles.winnerScore]}>
                {s1}
              </Text>
            </View>

            {/* Middle: VS & Round */}
            <View style={styles.vsBox}>
              <View style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <Text style={styles.roundText}>
                Round {item.gameRound || "1"}
              </Text>
            </View>

            {/* Player 2 */}
            <View style={styles.playerBox}>
              <Avatar.Text
                size={40}
                label={p2.substring(0, 2).toUpperCase()}
                style={[
                  styles.avatar,
                  styles.opponentAvatar,
                  p2Won && styles.winnerAvatar,
                ]}
                labelStyle={{ fontWeight: "700", color: "white", fontSize: 14 }}
              />
              <Text
                style={[styles.playerName, p2Won && styles.winnerText]}
                numberOfLines={1}
              >
                {p2}
              </Text>
              <Text style={[styles.scoreNumber, p2Won && styles.winnerScore]}>
                {s2}
              </Text>
            </View>
          </View>

          {/* Footer: Result Label & Delete Action */}
          <View style={styles.footerRow}>
            <View style={styles.resultPill}>
              <Text style={styles.resultPillText}>
                {isDraw ? "🤝 Draw" : p1Won ? `🏆 ${p1} won` : `🏆 ${p2} won`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteScore(item.id, p1, p2)}
              activeOpacity={0.7}
            >
              <IconButton
                icon="trash-can-outline"
                size={18}
                iconColor="#EF4444"
                style={{ margin: 0 }}
              />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2193F0" />
          <Text style={styles.loadingText}>Loading match history...</Text>
        </View>
      ) : scoresData.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>📋</Text>
          <Text style={styles.emptyTitle}>No Matches Logged Yet</Text>
          <Text style={styles.emptySubtitle}>
            Recorded matches will appear here with scores, venue, and outcomes.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scoresData}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardContent: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  dateTimeText: {
    fontSize: 12,
    color: "#64748B",
  },
  sportBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  scoreBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  playerBox: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2193F0",
    marginBottom: 6,
  },
  opponentAvatar: {
    backgroundColor: "#8B5CF6",
  },
  winnerAvatar: {
    borderWidth: 2,
    borderColor: "#16A34A",
  },
  playerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  winnerText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#64748B",
  },
  winnerScore: {
    color: "#16A34A",
  },
  vsBox: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  vsBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  vsText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
  roundText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  resultPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
});
