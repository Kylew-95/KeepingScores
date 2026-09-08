import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Card,
  Avatar,
  ActivityIndicator,
  Searchbar,
  Chip,
  DataTable,
  SegmentedButtons,
  Badge,
} from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";

export default function LeaderboardTab() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [availableSports, setAvailableSports] = useState(["All"]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // 1. Fetch from GlobalLeaderboard table
      let query = supabase
        .from("GlobalLeaderboard")
        .select("*")
        .order("win_rate", { ascending: false })
        .order("wins", { ascending: false })
        .order("total_matches", { ascending: false });

      if (selectedSport && selectedSport !== "All") {
        query = query.eq("activity", selectedSport);
      } else {
        query = query.eq("activity", "All");
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        setLeaderboard(data);
      } else {
        // Fallback: aggregate from ScoresData
        const [scoresRes, profilesRes] = await Promise.all([
          supabase.from("ScoresData").select("*"),
          supabase.from("UserProfileData").select("*"),
        ]);

        const rawScores = scoresRes.data || [];
        const rawProfiles = profilesRes.data || [];

        const stats = {};
        rawScores.forEach((s) => {
          if (
            selectedSport !== "All" &&
            s.activity?.trim().toLowerCase() !== selectedSport.toLowerCase()
          ) {
            return;
          }

          const players = s.players;
          if (!players || !Array.isArray(players) || players.length < 2) return;

          const p1 = (players[0]?.player1 || "").trim();
          const p2 = (players[1]?.player2 || "").trim();
          if (!p1 || !p2) return;

          const s1 = parseFloat(players[0]?.scores) || 0;
          const s2 = parseFloat(players[1]?.scores) || 0;

          [p1, p2].forEach((p) => {
            if (!stats[p]) {
              stats[p] = {
                player_name: p,
                wins: 0,
                losses: 0,
                draws: 0,
                total_matches: 0,
                win_streak: 0,
              };
            }
          });

          stats[p1].total_matches += 1;
          stats[p2].total_matches += 1;

          if (s1 > s2) {
            stats[p1].wins += 1;
            stats[p1].win_streak += 1;
            stats[p2].losses += 1;
            stats[p2].win_streak = 0;
          } else if (s2 > s1) {
            stats[p2].wins += 1;
            stats[p2].win_streak += 1;
            stats[p1].losses += 1;
            stats[p1].win_streak = 0;
          } else {
            stats[p1].draws += 1;
            stats[p2].draws += 1;
          }
        });

        const computedList = Object.values(stats).map((p) => {
          const wr =
            p.total_matches > 0
              ? Math.round((p.wins / p.total_matches) * 1000) / 10
              : 0;
          const prof = rawProfiles.find(
            (pr) =>
              (pr.first_name || "").trim().toLowerCase() ===
              p.player_name.trim().toLowerCase(),
          );
          return {
            ...p,
            win_rate: wr,
            avatar_image_url: prof?.avatar_image_url || null,
          };
        });

        computedList.sort((a, b) => {
          if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.total_matches - a.total_matches;
        });

        setLeaderboard(computedList);
      }

      // Fetch distinct sports
      const { data: sportsData } = await supabase
        .from("GlobalLeaderboard")
        .select("activity");

      if (sportsData && sportsData.length > 0) {
        const unique = new Set(["All"]);
        sportsData.forEach((r) => {
          if (r.activity && r.activity !== "All") {
            unique.add(r.activity.trim());
          }
        });
        setAvailableSports(Array.from(unique));
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSport]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase().trim();
    return leaderboard.filter((item) =>
      item.player_name.toLowerCase().includes(q),
    );
  }, [leaderboard, searchQuery]);

  const getMedalOrRank = (index) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return String(index + 1);
    }
  };

  const topThree = filteredList.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search & Toggle Row */}
      <View style={styles.topControls}>
        <Searchbar
          placeholder="Search player..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ minHeight: 0 }}
        />
        <View style={styles.viewToggleWrapper}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: "table", label: "Table", icon: "table" },
              { value: "cards", label: "Cards", icon: "cards-outline" },
            ]}
            style={styles.toggleSegment}
          />
        </View>
      </View>

      {/* Sports Filter Chips */}
      <View style={{ height: 44, marginVertical: 4 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {availableSports.map((sport) => (
            <Chip
              key={sport}
              selected={selectedSport === sport}
              onPress={() => setSelectedSport(sport)}
              style={[
                styles.chip,
                selectedSport === sport && styles.selectedChip,
              ]}
              textStyle={[
                styles.chipText,
                selectedSport === sport && styles.selectedChipText,
              ]}
            >
              {sport}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2193F0" />
          <Text style={{ marginTop: 12, color: "#64748B" }}>
            Loading Global Leaderboard...
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Top 3 Podium (Always shown on cards view or when searching) */}
          {viewMode === "cards" && topThree.length > 0 && (
            <View style={styles.podiumContainer}>
              <Text style={styles.podiumHeading}>🏆 Global Standings</Text>
              <View style={styles.podiumRow}>
                {topThree[1] && (
                  <View style={[styles.podiumCard, { marginTop: 20 }]}>
                    <Text style={styles.medalEmoji}>🥈</Text>
                    {topThree[1].avatar_image_url ? (
                      <Avatar.Image
                        size={52}
                        source={{ uri: topThree[1].avatar_image_url }}
                      />
                    ) : (
                      <Avatar.Text
                        size={52}
                        label={topThree[1].player_name
                          .substring(0, 2)
                          .toUpperCase()}
                        style={{ backgroundColor: "#94A3B8" }}
                      />
                    )}
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {topThree[1].player_name}
                    </Text>
                    <Badge style={styles.podiumBadge}>
                      {topThree[1].win_rate}%
                    </Badge>
                    <Text style={styles.podiumStats}>
                      {topThree[1].wins}W / {topThree[1].losses}L
                    </Text>
                  </View>
                )}

                {topThree[0] && (
                  <View style={[styles.podiumCard, styles.goldCard]}>
                    <Text style={styles.medalEmoji}>👑 🥇</Text>
                    {topThree[0].avatar_image_url ? (
                      <Avatar.Image
                        size={64}
                        source={{ uri: topThree[0].avatar_image_url }}
                        style={{ borderWidth: 2, borderColor: "#FFD700" }}
                      />
                    ) : (
                      <Avatar.Text
                        size={64}
                        label={topThree[0].player_name
                          .substring(0, 2)
                          .toUpperCase()}
                        style={{ backgroundColor: "#FFD700" }}
                      />
                    )}
                    <Text
                      style={[styles.podiumName, { fontWeight: "bold" }]}
                      numberOfLines={1}
                    >
                      {topThree[0].player_name}
                    </Text>
                    <Badge
                      style={[
                        styles.podiumBadge,
                        { backgroundColor: "#FFD700", color: "#000" },
                      ]}
                    >
                      {topThree[0].win_rate}%
                    </Badge>
                    <Text style={styles.podiumStats}>
                      {topThree[0].wins}W / {topThree[0].losses}L
                    </Text>
                  </View>
                )}

                {topThree[2] && (
                  <View style={[styles.podiumCard, { marginTop: 30 }]}>
                    <Text style={styles.medalEmoji}>🥉</Text>
                    {topThree[2].avatar_image_url ? (
                      <Avatar.Image
                        size={48}
                        source={{ uri: topThree[2].avatar_image_url }}
                      />
                    ) : (
                      <Avatar.Text
                        size={48}
                        label={topThree[2].player_name
                          .substring(0, 2)
                          .toUpperCase()}
                        style={{ backgroundColor: "#CD7F32" }}
                      />
                    )}
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {topThree[2].player_name}
                    </Text>
                    <Badge style={styles.podiumBadge}>
                      {topThree[2].win_rate}%
                    </Badge>
                    <Text style={styles.podiumStats}>
                      {topThree[2].wins}W / {topThree[2].losses}L
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TABLE VIEW */}
          {viewMode === "table" ? (
            <Card style={styles.tableCard}>
              <View style={styles.tableCardHeader}>
                <Text style={styles.tableTitle}>
                  📋 Global League Table ({selectedSport})
                </Text>
                <Text style={styles.tableSubtitle}>
                  Ranked by Win Rate % and Match Wins
                </Text>
              </View>

              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={styles.colRank}>#</DataTable.Title>
                  <DataTable.Title style={styles.colPlayer}>
                    Player
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.colStat}>
                    P
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.colStat}>
                    W
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.colStat}>
                    L
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.colWinRate}>
                    Win%
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.colStreak}>
                    Streak
                  </DataTable.Title>
                </DataTable.Header>

                {filteredList.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={{ color: "gray", fontSize: 14 }}>
                      No player records found.
                    </Text>
                  </View>
                ) : (
                  filteredList.map((item, index) => {
                    const isTopThree = index < 3;
                    const isEven = index % 2 === 0;
                    return (
                      <DataTable.Row
                        key={item.player_name}
                        style={[
                          styles.tableRow,
                          isEven ? styles.rowEven : styles.rowOdd,
                          isTopThree && styles.topThreeRow,
                        ]}
                      >
                        {/* Rank */}
                        <DataTable.Cell style={styles.colRank}>
                          <Text
                            style={[
                              styles.rankBadgeText,
                              isTopThree && styles.rankTopText,
                            ]}
                          >
                            {getMedalOrRank(index)}
                          </Text>
                        </DataTable.Cell>

                        {/* Player (Avatar + Name) */}
                        <DataTable.Cell style={styles.colPlayer}>
                          <View style={styles.playerCellRow}>
                            {item.avatar_image_url ? (
                              <Avatar.Image
                                size={28}
                                source={{ uri: item.avatar_image_url }}
                              />
                            ) : (
                              <Avatar.Text
                                size={28}
                                label={item.player_name
                                  .substring(0, 1)
                                  .toUpperCase()}
                                style={{ backgroundColor: "#2193F0" }}
                                labelStyle={{ fontSize: 12, color: "white" }}
                              />
                            )}
                            <Text
                              style={[
                                styles.playerCellName,
                                isTopThree && { fontWeight: "700" },
                              ]}
                              numberOfLines={1}
                            >
                              {item.player_name}
                            </Text>
                          </View>
                        </DataTable.Cell>

                        {/* Played */}
                        <DataTable.Cell numeric style={styles.colStat}>
                          <Text style={styles.statCellText}>
                            {item.total_matches}
                          </Text>
                        </DataTable.Cell>

                        {/* Wins */}
                        <DataTable.Cell numeric style={styles.colStat}>
                          <Text style={styles.winCellText}>{item.wins}</Text>
                        </DataTable.Cell>

                        {/* Losses */}
                        <DataTable.Cell numeric style={styles.colStat}>
                          <Text style={styles.lossCellText}>{item.losses}</Text>
                        </DataTable.Cell>

                        {/* Win Rate % */}
                        <DataTable.Cell numeric style={styles.colWinRate}>
                          <Text style={styles.winRateCellText}>
                            {item.win_rate}%
                          </Text>
                        </DataTable.Cell>

                        {/* Streak */}
                        <DataTable.Cell numeric style={styles.colStreak}>
                          <Text style={styles.streakCellText}>
                            {item.win_streak > 0 ? `🔥${item.win_streak}` : "—"}
                          </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })
                )}
              </DataTable>
            </Card>
          ) : (
            /* CARDS VIEW */
            <View style={{ marginTop: 8 }}>
              {filteredList.map((item, index) => (
                <Card key={item.player_name} style={styles.playerCard}>
                  <View style={styles.cardRow}>
                    <View style={styles.cardRankCircle}>
                      <Text style={styles.cardRankText}>
                        {getMedalOrRank(index)}
                      </Text>
                    </View>

                    {item.avatar_image_url ? (
                      <Avatar.Image
                        size={46}
                        source={{ uri: item.avatar_image_url }}
                      />
                    ) : (
                      <Avatar.Text
                        size={46}
                        label={item.player_name.substring(0, 2).toUpperCase()}
                        style={{ backgroundColor: "#2193F0" }}
                      />
                    )}

                    <View style={styles.cardInfo}>
                      <View style={styles.cardNameRow}>
                        <Text style={styles.cardPlayerName} numberOfLines={1}>
                          {item.player_name}
                        </Text>
                        <Text style={styles.cardWinRateText}>
                          {item.win_rate}% Win Rate
                        </Text>
                      </View>

                      <View style={styles.cardStatsRow}>
                        <Text style={styles.cardStat}>
                          Played:{" "}
                          <Text style={styles.statVal}>
                            {item.total_matches}
                          </Text>
                        </Text>
                        <Text style={styles.cardStat}>
                          W: <Text style={styles.statValWin}>{item.wins}</Text>
                        </Text>
                        <Text style={styles.cardStat}>
                          L:{" "}
                          <Text style={styles.statValLoss}>{item.losses}</Text>
                        </Text>
                        <Text style={styles.cardStat}>
                          Streak:{" "}
                          <Text style={styles.statValStreak}>
                            {item.win_streak > 0 ? `🔥${item.win_streak}` : "—"}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topControls: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchbar: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    borderRadius: 12,
    height: 44,
  },
  viewToggleWrapper: {
    marginTop: 8,
  },
  toggleSegment: {
    backgroundColor: "#FFFFFF",
  },
  chipScroll: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  chip: {
    backgroundColor: "#E2E8F0",
    height: 32,
    marginRight: 6,
  },
  selectedChip: {
    backgroundColor: "#2193F0",
  },
  chipText: {
    fontSize: 12,
    color: "#334155",
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  tableCard: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: "hidden",
  },
  tableCardHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  tableSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  tableHeader: {
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 48,
  },
  rowEven: {
    backgroundColor: "#FFFFFF",
  },
  rowOdd: {
    backgroundColor: "#FAFCFE",
  },
  topThreeRow: {
    backgroundColor: "#F0F9FF",
  },
  colRank: {
    flex: 0.6,
    justifyContent: "center",
  },
  colPlayer: {
    flex: 2.5,
    justifyContent: "flex-start",
  },
  colStat: {
    flex: 0.8,
    justifyContent: "center",
  },
  colWinRate: {
    flex: 1.2,
    justifyContent: "center",
  },
  colStreak: {
    flex: 1.1,
    justifyContent: "center",
  },
  rankBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  rankTopText: {
    fontSize: 16,
  },
  playerCellRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerCellName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 6,
    maxWidth: 95,
  },
  statCellText: {
    fontSize: 13,
    color: "#475569",
  },
  winCellText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  lossCellText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  winRateCellText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2193F0",
  },
  streakCellText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EA580C",
  },
  emptyTable: {
    paddingVertical: 32,
    alignItems: "center",
  },
  podiumContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  podiumHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 2,
  },
  podiumCard: {
    alignItems: "center",
    width: "30%",
  },
  goldCard: {
    transform: [{ scale: 1.06 }],
  },
  medalEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 6,
  },
  podiumBadge: {
    backgroundColor: "#2193F0",
    marginTop: 4,
    fontWeight: "700",
    fontSize: 11,
  },
  podiumStats: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  playerCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardRankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardRankText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPlayerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  cardWinRateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2193F0",
  },
  cardStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  cardStat: {
    fontSize: 12,
    color: "#64748B",
  },
  statVal: {
    fontWeight: "700",
    color: "#0F172A",
  },
  statValWin: {
    fontWeight: "700",
    color: "#16A34A",
  },
  statValLoss: {
    fontWeight: "700",
    color: "#DC2626",
  },
  statValStreak: {
    fontWeight: "700",
    color: "#EA580C",
  },
});
