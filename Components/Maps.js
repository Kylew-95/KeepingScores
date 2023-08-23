import React, { useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY } from "@env";
import axios from "axios";
import * as Location from "expo-location";

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

  const handleGooglePlaceSelect = (data) => {
    console.log("data", data);
    setMapRegion({
      latitude: data.geometry.location.lat,
      longitude: data.geometry.location.lng,

      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       console.log("Permission to access location was denied");
  //       return;
  //     }

  //     let location = await Location.getCurrentPositionAsync({});
  //     console.log("location", location);
  //     setMapRegion({
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //       latitudeDelta: 0.0922,
  //       longitudeDelta: 0.0421,
  //     });
  //   })();
  // }, []);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      const keyWords = ["leisure", "gym", "park", "swimming"];
      try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.40322%2C-0.16831&radius=10000&keyword=${keyWords
          .map((word) => encodeURIComponent(word))
          .join("%7C")}&key=AIzaSyBOGdOyuw2M85OMlkrTTDC1j3pYrR6XGfc`;

        const response = await fetch(apiUrl);
        const responseData = await response.json();
        console.log(responseData);

        if (responseData.status === "OK") {
          setPlaces(responseData.results);
        }
      } catch (error) {
        console.error("Error fetching nearby places:", error);
      }
    };

    if (searchQuery) {
      fetchNearbyPlaces();
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {places.map((place) => (
          <Marker
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

      <GooglePlacesAutocomplete
        placeholder="Search"
        minLength={2}
        autoFocus={false}
        returnKeyType={"search"}
        listViewDisplayed="auto"
        fetchDetails={true}
        query={{
          key: "AIzaSyBOGdOyuw2M85OMlkrTTDC1j3pYrR6XGfc",
          language: "en",
        }}
        onPress={(data, details = null) => {
          console.log("Place selected:", data);
          handleGooglePlaceSelect(data);
        }}
      />

      {/* <Searchbar
        style={styles.searchbar}
        iconColor="white"
        placeholderTextColor={"white"}
        inputStyle={{ color: "white" }}
        mode="bar"
        placeholder="Search"
        onChange={onChangeSearch}
        value={searchQuery}
        inputContainerStyle={{ backgroundColor: "#00171F", borderRadius: 20 }}
        icon={() => (
          <TouchableOpacity onPress={toggleBottomSheet}>
            <Image
              source={require("../Images/burgermenu.png")}
              style={{
                width: 30,
                height: 30,
                alignSelf: "center",
                right: 0,
              }}
            />
          </TouchableOpacity>
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
      /> */}
    </View>
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
  searchbar: {
    alignSelf: "center",
    position: "absolute",
    backgroundColor: "white",
    top: 60,
    width: "80%",
    backgroundColor: "#00171F",
    borderRadius: 20,
  },
});
