import React, { useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import MapCarousel from "./MapCarousel";

export default function Maps({
  profileData,
  openBottomSheet,
  closeBottomSheet,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.50853,
    longitude: -0.12574,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [places, setPlaces] = useState([]);

  const onChangeSearch = (query) => setSearchQuery(query);

  const toggleBottomSheet = () => {
    if (openBottomSheet) {
      closeBottomSheet();
    } else {
      openBottomSheet();
    }
  };

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleGooglePlaceSelect = async (data) => {
    try {
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.place_id}&key=${apiKey}`;
      const response = await fetch(placeDetailsUrl);
      const placeDetailsData = await response.json();

      if (placeDetailsData.status === "OK") {
        const selectedLocation = placeDetailsData.result[0].geometry.location;
        console.log("Selected Location:", selectedLocation);

        setMapRegion({
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }

    setSearchQuery(data);
  };
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      const keyWords = ["leisure", "gym", "park", "swimming"];
      try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
          mapRegion.latitude
        }%2C${mapRegion.longitude}&radius=10000&keyword=${keyWords
          .map((word) => encodeURIComponent(word))
          .join("%7C")}&key=${apiKey}`;

        const response = await fetch(apiUrl);
        const responseData = await response.json();

        if (responseData.status === "OK") {
          setPlaces(responseData.results);
        }
      } catch (error) {
        console.error("Error fetching nearby places:", error);
      }
    };

    fetchNearbyPlaces();
  }, [
    mapRegion ? mapRegion.latitude : null,
    mapRegion ? mapRegion.longitude : null,
  ]);

  const handleCarouselItemChange = (selectedPlace) => {
    setMapRegion({
      latitude: selectedPlace.geometry?.location.lat,
      longitude: selectedPlace.geometry?.location.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  return (
    <>
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          minLength={2}
          autoFocus={false}
          returnKeyType={"search"}
          listViewDisplayed="auto"
          fetchDetails={true}
          query={{
            key: apiKey,
            language: "en",
          }}
          onPress={(data, details = null) => {
            console.log("Place selected:", details);
            console.log("Place selected:", data);
            handleGooglePlaceSelect(data);
          }}
        />
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
        >
          {places.length > 0 &&
            places.map((place) => (
              <Marker
                tappable={true}
                key={place.place_id}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                description={place.vicinity}
                pinColor="#00171F"
              />
            ))}
        </MapView>
      </View>
      {/* <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={{
          position: "absolute",
          alignSelf: "center",
          top: 60,
          width: "70%",
          height: 50,
          backgroundColor: "#00171F",
          zIndex: 1,
        }}
      /> */}
      <View>
        <MapCarousel
          onCarouselItemChange={handleCarouselItemChange}
          mapRegion={mapRegion}
          places={places}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
