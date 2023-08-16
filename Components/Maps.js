import React, { useState, useCallback } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StyleSheet, View, Image } from "react-native";
import { Searchbar } from "react-native-paper";

export default function Maps({ profileData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.5072,
    longitude: -0.1276,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [markerCoordinates, setMarkerCoordinates] = useState(null);

  const onChangeSearch = (query) => setSearchQuery(query);

  const handleSearchResult = useCallback(
    (result) => {
      if (result && result.geometry && result.geometry.location) {
        const { location } = result.geometry;
        setMapRegion({
          ...mapRegion,
          latitude: location.lat,
          longitude: location.lng,
        });
        setMarkerCoordinates(location);
      }
    },
    [mapRegion]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
      >
        {markerCoordinates && (
          <Marker
            coordinate={markerCoordinates}
            title="Search Result"
            description="Searched Location"
          />
        )}
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
          // You might use a geocoding API to get location details based on searchQuery
          // For now, we'll simulate a search result
          const simulatedSearchResult = {
            geometry: {
              location: {
                lat: 51.5072,
                lng: -0.1276,
              },
            },
          };
          handleSearchResult(simulatedSearchResult);
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
              width: 40,
              height: 40,
              alignSelf: "center",
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
