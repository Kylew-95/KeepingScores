import Carousel from "react-native-snap-carousel";
import { Dimensions, View, Text } from "react-native";
import { Card } from "react-native-paper";
import React from "react";

const renderItem = ({ item, index }) => {
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=AIzaSyBOGdOyuw2M85OMlkrTTDC1j3pYrR6XGfc`;

  return (
    <View style={[styles.slide]}>
      <Card style={styles.card}>
        <Card.Cover
          source={{
            uri: photoUrl,
          }}
        />
        <Card.Content>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.vicinity}</Text>
          <Text style={styles.description}>Rating: {item.rating}</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

export default function MapCarousel({ places, onCarouselItemChange }) {
  const sliderWidth = Dimensions.get("window").width;
  const itemWidth = Dimensions.get("window").width - 60;

  return (
    <View style={{ bottom: 35, backgroundColor: "transparent" }}>
      <Carousel
        style={{ backgroundColor: "transparent" }}
        onSnapToItem={(index) => onCarouselItemChange(index, places[index])}
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
