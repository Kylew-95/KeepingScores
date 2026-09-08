import React, { useRef, useEffect } from "react";
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
  park: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=500&q=80",
  default:
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&q=80",
};

export default function MapCarousel({ places = [], onCarouselItemChange }) {
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);

  if (!places || places.length === 0) {
    return null;
  }

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < places.length) {
      activeIndexRef.current = index;
      if (onCarouselItemChange) {
        onCarouselItemChange(places[index]);
      }
    }
  };

  const renderCard = ({ item, index }) => {
    const photoUrl =
      item.photo ||
      sportImages[item.type] ||
      sportImages[item.sport] ||
      sportImages.default;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          activeIndexRef.current = index;
          flatListRef.current?.scrollToOffset({
            offset: index * SNAP_INTERVAL,
            animated: true,
          });
          if (onCarouselItemChange) {
            onCarouselItemChange(item);
          }
        }}
        style={[
          styles.slide,
          { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN },
        ]}
      >
        <Card style={styles.card}>
          <Card.Cover style={styles.cardCover} source={{ uri: photoUrl }} />
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name || "Sports Facility"}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {item.vicinity || "No Address"}
            </Text>
            <Text style={styles.rating}>Rating: {item.rating || "4.5"}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={places}
        renderItem={renderCard}
        keyExtractor={(item, index) =>
          item.place_id ? String(item.place_id) : String(index)
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
        }}
        onMomentumScrollEnd={handleScrollEnd}
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
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 12,
    borderColor: "transparent",
    elevation: 4,
    overflow: "hidden",
  },
  cardCover: {
    height: 140,
    resizeMode: "cover",
    borderRadius: 0,
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: 12,
    color: "#d0d0d0",
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    color: "#ffd700",
    marginTop: 4,
    fontWeight: "600",
  },
});
