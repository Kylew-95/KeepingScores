import React, { useRef, useState, useCallback, memo } from "react";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Card } from "react-native-paper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 60, 320);
const CARD_MARGIN = 8;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

const sportImages = {
  fitness_centre:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
  sports_centre:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80",
  pitch:
    "https://images.unsplash.com/photo-1529900245534-47fbf7c3f600?w=500&q=80",
  football:
    "https://images.unsplash.com/photo-1529900245534-47fbf7c3f600?w=500&q=80",
  swimming_pool:
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&q=80",
  tennis:
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80",
  park: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=500&q=80",
  default:
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&q=80",
};

// Safe Image component with Keeping Score Logo fallback on error or missing image
const CardImage = memo(function CardImage({ uri }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !uri) {
    return (
      <View style={styles.fallbackLogoContainer}>
        <Image
          source={require("../Images/Logo-Keeping-Score.png")}
          style={styles.fallbackLogoImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.cardCover}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
});

// Memoized Card Component for high performance VirtualizedList rendering
const CarouselCard = memo(function CarouselCard({ item, index, onPress }) {
  const photoUrl =
    item.photo ||
    sportImages[item.type] ||
    sportImages[item.sport] ||
    sportImages.default;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item, index)}
      style={[
        styles.slide,
        { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN },
      ]}
    >
      <Card style={styles.card}>
        <CardImage uri={photoUrl} />
        {item.distance && (
          <View style={styles.distanceFloatingBadge}>
            <Text style={styles.distanceFloatingText}>📍 {item.distance}</Text>
          </View>
        )}
        <Card.Content style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name || "Sports Facility"}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {item.vicinity || "No Address"}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.rating}>⭐ {item.rating || "4.5"}</Text>
            <Text style={styles.tapDetailsText}>Details & Maps →</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
});

export default function MapCarousel({
  places = [],
  onCarouselItemChange,
  onCardPress,
}) {
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);

  const handleScrollEnd = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SNAP_INTERVAL);
      if (index >= 0 && index < places.length) {
        activeIndexRef.current = index;
        if (onCarouselItemChange) {
          onCarouselItemChange(places[index]);
        }
      }
    },
    [places, onCarouselItemChange],
  );

  const handleCardPress = useCallback(
    (item, index) => {
      activeIndexRef.current = index;
      flatListRef.current?.scrollToOffset({
        offset: index * SNAP_INTERVAL,
        animated: true,
      });
      if (onCarouselItemChange) {
        onCarouselItemChange(item);
      }
      if (onCardPress) {
        onCardPress(item);
      }
    },
    [onCarouselItemChange, onCardPress],
  );

  const renderCard = useCallback(
    ({ item, index }) => (
      <CarouselCard item={item} index={index} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback(
    (item, index) => (item.place_id ? String(item.place_id) : String(index)),
    [],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: SNAP_INTERVAL,
      offset: SNAP_INTERVAL * index,
      index,
    }),
    [],
  );

  if (!places || places.length === 0) {
    return null;
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={places}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
        }}
        onMomentumScrollEnd={handleScrollEnd}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    bottom: 35,
    backgroundColor: "transparent",
  },
  slide: {
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "rgba(0, 23, 31, 0.85)",
    borderRadius: 14,
    borderColor: "rgba(33, 147, 240, 0.4)",
    borderWidth: 1,
    elevation: 5,
    overflow: "hidden",
  },
  cardCover: {
    height: 125,
    width: "100%",
  },
  fallbackLogoContainer: {
    height: 125,
    width: "100%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  fallbackLogoImage: {
    width: 170,
    height: 48,
  },

  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    color: "#ffd700",
    fontWeight: "600",
  },
  distanceFloatingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 23, 31, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2193F0",
    zIndex: 10,
  },
  distanceFloatingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  tapDetailsText: {
    fontSize: 11,
    color: "#38BDF8",
    fontWeight: "700",
  },
});
