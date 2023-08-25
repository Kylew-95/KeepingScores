import React, { useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StyleSheet, View, Dimensions } from "react-native";
import { Searchbar } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import MapCarousel from "./MapCarousel";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleGooglePlaceSelect = async (data) => {
    try {
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.place_id}&key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY`;
      const response = await fetch(placeDetailsUrl);
      const placeDetailsData = await response.json();

      if (placeDetailsData.status === "OK") {
        const selectedLocation = placeDetailsData.result.geometry.location;
        console.log("Selected Location:", selectedLocation);

        setMapRegion({
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        setPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }

    setSearchQuery("");
  };

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      const keyWords = ["leisure", "gym", "park", "swimming"];
      try {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
          mapRegion.latitude
        }%2C${mapRegion.longitude}&radius=10000&keyword=${keyWords
          .map((word) => encodeURIComponent(word))
          .join("%7C")}&key=AIzaSyBOGdOyuw2M85OMlkrTTDC1j3pYrR6XGfc`;

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
            key: "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY",
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
          {places.map((place) => (
            <Marker
              tappable={true}
              key={place.place_id}
              coordinate={{
                latitude: place.geometry.location?.lat,
                longitude: place.geometry.location?.lng,
              }}
              title={place.name}
              description={place.vicinity}
              pinColor="#00171F"
            />
          ))}
        </MapView>

        {/* <Searchbar
        clearButtonMode="always"
        style={styles.searchbar}
        iconColor="white"
        placeholderTextColor={"white"}
        inputStyle={{ color: "white" }}
        mode="bar"
        placeholder="Search"
        inputContainerStyle={{ backgroundColor: "#00171F", borderRadius: 20 }}
        onTextInput={(query) => onChangeSearch(query)}
        value={searchQuery}
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
      /> */}
      </View>
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
  searchbar: {
    alignSelf: "center",
    position: "absolute",
    backgroundColor: "white",
    top: 60,
    width: "80%",
    backgroundColor: "#00171F",
  },
});
