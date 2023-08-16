import React, { useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StyleSheet, View, Image } from "react-native";
import { Searchbar } from "react-native-paper";
import axios from "axios";
import { RADAR_API_KEY } from "@env";

export default function Maps({ profileData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.5072,
    longitude: -0.1276,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [places, setPlaces] = useState([]);

  const onChangeSearch = (query) => setSearchQuery(query);

  const fetchPlaces = async (searchQuery) => {
    try {
      const response = await axios.get(
        `https://api.radar.io/v1/search/places?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${RADAR_API_KEY}`,
          },
        }
      );
      setPlaces(response.data.places);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.location.geometry.coordinates[1],
              longitude: place.location.geometry.coordinates[0],
            }}
            title={place.name}
            description={place.categories.join(", ")}
          />
        ))}
      </MapView>
      <Searchbar
        style={styles.searchbar}
        iconColor="white"
        placeholderTextColor={"white"}
        inputStyle={{ color: "white" }}
        mode="bar"
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        onEndEditing={() => {
          fetchPlaces(searchQuery);
        }}
        inputContainerStyle={{ backgroundColor: "#00171F", borderRadius: 20 }}
        icon={() => (
          <Image
            source={require("../Images/burgermenu.png")}
            style={{
              width: 30,
              height: 30,
              alignSelf: "center",
              right: 0,
            }}
          />
        )}
        clearIcon={() => (
          <Image
            source={{ uri: profileData?.avatar_image_url }}
            style={{
              width: 30,
              height: 30,
              alignSelf: "center",
              right: 0,
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchbar: {
    alignSelf: "center",
    position: "absolute",
    backgroundColor: "white",
    top: 140,
    width: "80%",
    backgroundColor: "#00171F",
    borderRadius: 20,
  },
});
