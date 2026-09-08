import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
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
  Button,
  IconButton,
} from "react-native-paper";
import { supabase } from "../../SupabaseConfig/SupabaseClient";

export default function LeaderboardTab({ userId, profileData }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [availableSports, setAvailableSports] = useState(["All"]);

  // Follow state
  const [currentUserId, setCurrentUserId] = useState(
    userId || profileData?.userprofile_id,
  );
  const [currentUserName, setCurrentUserName] = useState(
    profileData?.first_name || "",
  );
  const [followingIds, setFollowingIds] = useState(new Set());
  const [followingNames, setFollowingNames] = useState(new Set());
  const [userProfilesMap, setUserProfilesMap] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

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

  const loadFollows = useCallback(async () => {
    let uid = currentUserId;
    if (!uid) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        uid = authData.user.id;
        setCurrentUserId(uid);
      }
    }
    if (!uid) return;

    try {
      const { data: follows } = await supabase
        .from("UserFollows")
        .select("following_id, following_name")
        .eq("follower_id", uid);

      if (follows) {
        const idSet = new Set();
        const nameSet = new Set();
        follows.forEach((f) => {
          if (f.following_id) idSet.add(f.following_id);
          if (f.following_name)
            nameSet.add(f.following_name.trim().toLowerCase());
        });
        setFollowingIds(idSet);
        setFollowingNames(nameSet);
      }

      const { data: profiles } = await supabase
        .from("UserProfileData")
        .select("userprofile_id, first_name, last_name, avatar_image_url");

      if (profiles) {
        const map = {};
        profiles.forEach((p) => {
          if (p.first_name) {
            map[p.first_name.trim().toLowerCase()] = p;
          }
          if (p.userprofile_id) {
            map[p.userprofile_id] = p;
          }
        });
        setUserProfilesMap(map);
      }
    } catch (err) {
      console.log("Error loading follows in Leaderboard:", err);
    }
  }, [currentUserId]);

  // Auto-refresh leaderboard and follows whenever tab is clicked / focused
  useEffect(() => {
    fetchLeaderboard();
    loadFollows();

    const unsubscribe = navigation?.addListener
      ? navigation.addListener("focus", () => {
          fetchLeaderboard();
          loadFollows();
        })
      : undefined;

    return unsubscribe;
  }, [navigation, fetchLeaderboard, loadFollows]);

  const checkIfFollowing = (item) => {
    if (!item) return false;
    const nameKey = (item.player_name || "").trim().toLowerCase();
    if (followingNames.has(nameKey)) return true;
    if (item.userprofile_id && followingIds.has(item.userprofile_id))
      return true;
    const mapped = userProfilesMap[nameKey];
    if (mapped?.userprofile_id && followingIds.has(mapped.userprofile_id))
      return true;
    return false;
  };

  const checkIfSelf = (item) => {
    if (!item) return false;
    const nameKey = (item.player_name || "").trim().toLowerCase();
    const myName = (currentUserName || profileData?.first_name || "")
      .trim()
      .toLowerCase();
    if (myName && nameKey === myName) return true;
    if (
      currentUserId &&
      item.userprofile_id &&
      item.userprofile_id === currentUserId
    )
      return true;
    return false;
  };

  const toggleFollowPlayer = async (item) => {
    let uid = currentUserId;
    if (!uid) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        uid = authData.user.id;
        setCurrentUserId(uid);
      } else {
        Alert.alert("Sign In Required", "Please sign in to follow players.");
        return;
      }
    }

    if (checkIfSelf(item)) {
      Alert.alert("That's you!", "You are viewing your own profile ranking.");
      return;
    }

    const isFollowing = checkIfFollowing(item);
    const nameKey = item.player_name.trim().toLowerCase();
    const targetUid =
      item.userprofile_id || userProfilesMap[nameKey]?.userprofile_id || null;

    // Optimistic state update
    setFollowingNames((prev) => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(nameKey);
      } else {
        next.add(nameKey);
      }
      return next;
    });

    if (targetUid) {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) {
          next.delete(targetUid);
        } else {
          next.add(targetUid);
        }
        return next;
      });
    }

    try {
      if (isFollowing) {
        if (targetUid) {
          await supabase
            .from("UserFollows")
            .delete()
            .eq("follower_id", uid)
            .eq("following_id", targetUid);
        } else {
          await supabase
            .from("UserFollows")
            .delete()
            .eq("follower_id", uid)
            .ilike("following_name", item.player_name.trim());
        }
      } else {
        await supabase.from("UserFollows").insert({
          follower_id: uid,
          following_id: targetUid,
          following_name: item.player_name.trim(),
        });
      }
    } catch (err) {
      console.error("Error updating follow:", err);
      loadFollows();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLeaderboard(), loadFollows()]);
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
                    {!checkIfSelf(topThree[1]) ? (
                      <TouchableOpacity
                        style={[
                          styles.podiumFollowBtn,
                          checkIfFollowing(topThree[1])
                            ? styles.podiumFollowingBtn
                            : styles.podiumNotFollowingBtn,
                        ]}
                        onPress={() => toggleFollowPlayer(topThree[1])}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.podiumFollowBtnText,
                            checkIfFollowing(topThree[1])
                              ? styles.podiumFollowingBtnText
                              : styles.podiumNotFollowingBtnText,
                          ]}
                        >
                          {checkIfFollowing(topThree[1])
                            ? "✓ Following"
                            : "+ Follow"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Badge style={styles.podiumSelfBadge}>You</Badge>
                    )}
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
                    {!checkIfSelf(topThree[0]) ? (
                      <TouchableOpacity
                        style={[
                          styles.podiumFollowBtn,
                          checkIfFollowing(topThree[0])
                            ? styles.podiumFollowingBtn
                            : styles.podiumNotFollowingBtn,
                        ]}
                        onPress={() => toggleFollowPlayer(topThree[0])}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.podiumFollowBtnText,
                            checkIfFollowing(topThree[0])
                              ? styles.podiumFollowingBtnText
                              : styles.podiumNotFollowingBtnText,
                          ]}
                        >
                          {checkIfFollowing(topThree[0])
                            ? "✓ Following"
                            : "+ Follow"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Badge style={styles.podiumSelfBadge}>You</Badge>
                    )}
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
                    {!checkIfSelf(topThree[2]) ? (
                      <TouchableOpacity
                        style={[
                          styles.podiumFollowBtn,
                          checkIfFollowing(topThree[2])
                            ? styles.podiumFollowingBtn
                            : styles.podiumNotFollowingBtn,
                        ]}
                        onPress={() => toggleFollowPlayer(topThree[2])}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.podiumFollowBtnText,
                            checkIfFollowing(topThree[2])
                              ? styles.podiumFollowingBtnText
                              : styles.podiumNotFollowingBtnText,
                          ]}
                        >
                          {checkIfFollowing(topThree[2])
                            ? "✓ Following"
                            : "+ Follow"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Badge style={styles.podiumSelfBadge}>You</Badge>
                    )}
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
                    Strk
                  </DataTable.Title>
                  <DataTable.Title style={styles.colAction}>
                    Follow
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
                        onPress={() => {
                          setSelectedPlayer(item);
                          setPlayerModalVisible(true);
                        }}
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

                        {/* Follow Action */}
                        <DataTable.Cell style={styles.colAction}>
                          {checkIfSelf(item) ? (
                            <Badge style={styles.selfBadge}>You</Badge>
                          ) : (
                            <TouchableOpacity
                              style={[
                                styles.tableFollowBtn,
                                checkIfFollowing(item)
                                  ? styles.tableFollowingBtn
                                  : styles.tableNotFollowingBtn,
                              ]}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                toggleFollowPlayer(item);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.tableFollowBtnText,
                                  checkIfFollowing(item)
                                    ? styles.tableFollowingBtnText
                                    : styles.tableNotFollowingBtnText,
                                ]}
                              >
                                {checkIfFollowing(item) ? "✓" : "+ Follow"}
                              </Text>
                            </TouchableOpacity>
                          )}
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
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedPlayer(item);
                      setPlayerModalVisible(true);
                    }}
                  >
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
                            P:{" "}
                            <Text style={styles.statVal}>
                              {item.total_matches}
                            </Text>
                          </Text>
                          <Text style={styles.cardStat}>
                            W:{" "}
                            <Text style={styles.statValWin}>{item.wins}</Text>
                          </Text>
                          <Text style={styles.cardStat}>
                            L:{" "}
                            <Text style={styles.statValLoss}>
                              {item.losses}
                            </Text>
                          </Text>
                          <Text style={styles.cardStat}>
                            Streak:{" "}
                            <Text style={styles.statValStreak}>
                              {item.win_streak > 0
                                ? `🔥${item.win_streak}`
                                : "—"}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Follow Button on Card */}
                      <View style={styles.cardActionWrapper}>
                        {checkIfSelf(item) ? (
                          <Badge style={styles.selfBadge}>You</Badge>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.cardFollowBtn,
                              checkIfFollowing(item)
                                ? styles.cardFollowingBtn
                                : styles.cardNotFollowingBtn,
                            ]}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              toggleFollowPlayer(item);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.cardFollowBtnText,
                                checkIfFollowing(item)
                                  ? styles.cardFollowingBtnText
                                  : styles.cardNotFollowingBtnText,
                              ]}
                            >
                              {checkIfFollowing(item)
                                ? "✓ Following"
                                : "+ Follow"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Player Detail & Follow Modal */}
      <Modal
        visible={playerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPlayerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlayer && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalHeading}>Player Profile</Text>
                  <IconButton
                    icon="close"
                    size={22}
                    onPress={() => setPlayerModalVisible(false)}
                  />
                </View>

                <View style={styles.modalAvatarContainer}>
                  {selectedPlayer.avatar_image_url ? (
                    <Avatar.Image
                      size={72}
                      source={{ uri: selectedPlayer.avatar_image_url }}
                    />
                  ) : (
                    <Avatar.Text
                      size={72}
                      label={selectedPlayer.player_name
                        .substring(0, 2)
                        .toUpperCase()}
                      style={{ backgroundColor: "#2193F0" }}
                    />
                  )}
                  <Text style={styles.modalPlayerName}>
                    {selectedPlayer.player_name}
                  </Text>
                  <Text style={styles.modalSubText}>
                    Sport:{" "}
                    {selectedSport === "All" ? "All Activities" : selectedSport}
                  </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Played</Text>
                    <Text style={styles.modalStatVal}>
                      {selectedPlayer.total_matches}
                    </Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Wins</Text>
                    <Text style={[styles.modalStatVal, { color: "#16A34A" }]}>
                      {selectedPlayer.wins}
                    </Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Losses</Text>
                    <Text style={[styles.modalStatVal, { color: "#DC2626" }]}>
                      {selectedPlayer.losses}
                    </Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Win Rate</Text>
                    <Text style={[styles.modalStatVal, { color: "#2193F0" }]}>
                      {selectedPlayer.win_rate}%
                    </Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Draws</Text>
                    <Text style={styles.modalStatVal}>
                      {selectedPlayer.draws || 0}
                    </Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatLabel}>Streak</Text>
                    <Text style={[styles.modalStatVal, { color: "#EA580C" }]}>
                      {selectedPlayer.win_streak > 0
                        ? `🔥 ${selectedPlayer.win_streak}`
                        : "0"}
                    </Text>
                  </View>
                </View>

                {/* Follow Action */}
                <View style={styles.modalActionWrapper}>
                  {checkIfSelf(selectedPlayer) ? (
                    <View style={styles.selfNotice}>
                      <Text style={styles.selfNoticeText}>
                        👤 This is your profile
                      </Text>
                    </View>
                  ) : (
                    <Button
                      mode={
                        checkIfFollowing(selectedPlayer)
                          ? "outlined"
                          : "contained"
                      }
                      onPress={() => toggleFollowPlayer(selectedPlayer)}
                      style={[
                        styles.modalFollowBtn,
                        checkIfFollowing(selectedPlayer)
                          ? styles.modalFollowingBtn
                          : styles.modalNotFollowingBtn,
                      ]}
                      labelStyle={{
                        fontWeight: "700",
                        color: checkIfFollowing(selectedPlayer)
                          ? "#64748B"
                          : "#FFFFFF",
                      }}
                      icon={
                        checkIfFollowing(selectedPlayer)
                          ? "account-check"
                          : "account-plus"
                      }
                    >
                      {checkIfFollowing(selectedPlayer)
                        ? "Following Player"
                        : "Follow Player"}
                    </Button>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    flex: 0.5,
    justifyContent: "center",
  },
  colPlayer: {
    flex: 2.2,
    justifyContent: "flex-start",
  },
  colStat: {
    flex: 0.65,
    justifyContent: "center",
  },
  colWinRate: {
    flex: 1.0,
    justifyContent: "center",
  },
  colStreak: {
    flex: 0.85,
    justifyContent: "center",
  },
  colAction: {
    flex: 1.4,
    justifyContent: "center",
    alignItems: "center",
  },
  tableFollowBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tableNotFollowingBtn: {
    backgroundColor: "#2193F0",
  },
  tableFollowingBtn: {
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  tableFollowBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tableNotFollowingBtnText: {
    color: "#FFFFFF",
  },
  tableFollowingBtnText: {
    color: "#475569",
  },
  selfBadge: {
    backgroundColor: "#94A3B8",
    fontSize: 10,
  },
  cardActionWrapper: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFollowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  cardNotFollowingBtn: {
    backgroundColor: "#2193F0",
  },
  cardFollowingBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cardFollowBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardNotFollowingBtnText: {
    color: "#FFFFFF",
  },
  cardFollowingBtnText: {
    color: "#475569",
  },
  podiumFollowBtn: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  podiumNotFollowingBtn: {
    backgroundColor: "#2193F0",
  },
  podiumFollowingBtn: {
    backgroundColor: "#E2E8F0",
  },
  podiumFollowBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  podiumNotFollowingBtnText: {
    color: "#FFFFFF",
  },
  podiumFollowingBtnText: {
    color: "#475569",
  },
  podiumSelfBadge: {
    marginTop: 6,
    backgroundColor: "#94A3B8",
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalAvatarContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  modalPlayerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },
  modalSubText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  modalStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
  },
  modalStatBox: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 6,
  },
  modalStatLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  modalStatVal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalActionWrapper: {
    marginTop: 8,
  },
  modalFollowBtn: {
    borderRadius: 12,
    paddingVertical: 2,
  },
  modalNotFollowingBtn: {
    backgroundColor: "#2193F0",
  },
  modalFollowingBtn: {
    borderColor: "#CBD5E1",
  },
  selfNotice: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  selfNoticeText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
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
