import { Dimensions, View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import Carousel, { CarouselProps } from "react-native-snap-carousel"; // Import CarouselProps from the library
import React from "react";

type Place = {
  name?: string;
  vicinity?: string;
  rating?: string;
  photos: { photo_reference: string }[];
}

interface MapCarouselProps {
  places: Place[];
  onCarouselItemChange: (place: Place) => void;
}

const renderItem: CarouselProps<Place>['renderItem'] = ({ item, index }) => { // Use CarouselProps for renderItem
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${item?.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  return (
    <View style={[styles.slide]}>
      <Card style={styles.card}>
        <Card.Cover
          style={{ height: 200, resizeMode: "contain", borderRadius: 10,
          width: 300,
         }}
          source={{
            uri: photoUrl,
          }}
        />
        <Card.Content>
          <Text style={styles.title}>{item?.name || "No Name"}</Text>
          <Text style={styles.description}>
            {item?.vicinity || "No Address"}
          </Text>
          <Text style={styles.description}>
            Rating: {item?.rating || "No Rating"}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

export default function MapCarousel({
  places,
  onCarouselItemChange,
}: MapCarouselProps) {
  const sliderWidth = Dimensions.get("window").width;
  const itemWidth = Dimensions.get("window").width - 60;

  return (
    <View style={{ bottom: 35, backgroundColor: "transparent" }}>
      <Carousel
        style={{ backgroundColor: "transparent" }}
        onSnapToItem={(index) => onCarouselItemChange(places[index])}
        loop={true}
        data={places}
        renderItem={renderItem}
        itemWidth={itemWidth}
        sliderWidth={sliderWidth}
        enableSnap={true}
        layout="default"
        autoplay={true}
        autoplayInterval={30000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: Dimensions.get("window").width - 60,
    backgroundColor: "transparent ",
  },
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    borderColor: "transparent",
    elevation: 0,
    resizeMode: "contain",
    width: 300,
    alignSelf: "center",
  },
  title: {
    fontSize: 16,

    color: "white",
  },
  description: {
    fontSize: 12,
    color: "white",
  },
});
