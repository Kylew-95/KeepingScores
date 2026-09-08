import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import { Searchbar } from "react-native-paper";
import * as Location from "expo-location";
import MapCarousel from "./MapCarousel";

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map {
      margin: 0; padding: 0; width: 100%; height: 100%;
      background-color: #f4f6f8;
    }
    .custom-sport-pin {
      background: #00171F;
      border: 2px solid #2193F0;
      border-radius: 50%;
      color: white;
      text-align: center;
      line-height: 28px;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .user-location-pin {
      background: #2193F0;
      border: 3px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 0 10px rgba(33, 147, 240, 0.8);
    }
    .leaflet-popup-content-wrapper {
      background: #00171F;
      color: white;
      border-radius: 8px;
      font-family: sans-serif;
    }
    .leaflet-popup-tip {
      background: #00171F;
    }
    .leaflet-popup-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #2193F0;
    }
    .leaflet-popup-content p {
      margin: 0;
      font-size: 12px;
      color: #ccc;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([51.50853, -0.12574], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    var userMarker = null;
    var markersLayer = L.layerGroup().addTo(map);

    function setUserLocation(lat, lon) {
      if (userMarker) {
        userMarker.setLatLng([lat, lon]);
      } else {
        var userIcon = L.divIcon({
          className: 'user-location-pin',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
      }
    }

    function flyToLocation(lat, lon, zoom) {
      map.flyTo([lat, lon], zoom || 15, { duration: 1.2 });
    }

    function updatePlaces(places) {
      markersLayer.clearLayers();
      if (!places || !places.length) return;

      var emojiMap = {
        fitness_centre: '🏋️',
        gym: '🏋️',
        sports_centre: '🏟️',
        pitch: '⚽',
        football: '⚽',
        swimming_pool: '🏊',
        park: '🌳',
        tennis: '🎾',
        badminton: '🏸',
        sports: '🏅'
      };

      places.forEach(function(place) {
        if (!place.geometry || !place.geometry.location) return;
        var lat = place.geometry.location.lat;
        var lng = place.geometry.location.lng;
        var iconEmoji = emojiMap[place.type] || emojiMap[place.sport] || '🏅';

        var customIcon = L.divIcon({
          className: 'custom-sport-pin',
          html: iconEmoji,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        var marker = L.marker([lat, lng], { icon: customIcon });
        var popupContent = '<h4>' + (place.name || 'Sports Venue') + '</h4><p>' + (place.vicinity || '') + '</p>';
        marker.bindPopup(popupContent);

        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              placeId: place.place_id
            }));
          }
        });

        markersLayer.addLayer(marker);
      });
    }

    map.on('moveend', function() {
      var center = map.getCenter();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapMoved',
          latitude: center.lat,
          longitude: center.lng
        }));
      }
    });
  </script>
</body>
</html>
`;

export default function Maps({
  profileData,
  openBottomSheet,
  closeBottomSheet,
}) {
  const webViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.50853,
    longitude: -0.12574,
  });
  const [places, setPlaces] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          const lat = location.coords.latitude;
          const lon = location.coords.longitude;
          setMapRegion({ latitude: lat, longitude: lon });
          if (isMapReady && webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              setUserLocation(${lat}, ${lon});
              flyToLocation(${lat}, ${lon}, 14);
              true;
            `);
          }
        }
      } catch (err) {
        console.log("Could not get user location:", err);
      }
    })();
  }, [isMapReady]);

  // 2. Fetch nearby sports/leisure places from OpenStreetMap Overpass API (Free)
  useEffect(() => {
    let isCancelled = false;
    const fetchNearbyPlaces = async () => {
      try {
        const lat = mapRegion.latitude;
        const lon = mapRegion.longitude;
        const query = `
          [out:json][timeout:15];
          (
            node["leisure"~"fitness_centre|sports_centre|pitch|swimming_pool|park"]["name"](around:4000, ${lat}, ${lon});
            way["leisure"~"fitness_centre|sports_centre|pitch|swimming_pool|park"]["name"](around:4000, ${lat}, ${lon});
          );
          out center 25;
        `;
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "KeepingScoresApp/1.0",
          },
          body: `data=${encodeURIComponent(query)}`,
        });
        const data = await response.json();
        if (!isCancelled && data.elements) {
          const formatted = data.elements.map((el) => {
            const pLat = el.lat || el.center?.lat;
            const pLon = el.lon || el.center?.lon;
            const tags = el.tags || {};
            const address =
              [tags["addr:street"], tags["addr:city"] || tags["addr:suburb"] || tags["addr:postcode"]]
                .filter(Boolean)
                .join(", ") || (tags.leisure ? tags.leisure.replace(/_/g, " ") : "Sports & Leisure");

            return {
              place_id: String(el.id),
              name: tags.name || "Sports Facility",
              vicinity: address,
              type: tags.leisure || tags.sport || "sports",
              sport: tags.sport || "",
              rating: "4.5",
              geometry: {
                location: {
                  lat: pLat,
                  lng: pLon,
                },
              },
            };
          });

          setPlaces(formatted);
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              updatePlaces(${JSON.stringify(formatted)});
              true;
            `);
          }
        }
      } catch (error) {
        console.error("Error fetching places from Overpass:", error);
      }
    };

    const timer = setTimeout(fetchNearbyPlaces, 800);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [mapRegion.latitude, mapRegion.longitude]);

  // 3. Search locations with Nominatim (Free Geocoding)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    Keyboard.dismiss();
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=5`;
      const response = await fetch(url, {
        headers: { "User-Agent": "KeepingScoresApp/1.0" },
      });
      const data = await response.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error("Geocoding search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setMapRegion({ latitude: lat, longitude: lon });
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        flyToLocation(${lat}, ${lon}, 15);
        true;
      `);
    }
    setSearchQuery(item.display_name.split(",")[0]);
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleCarouselItemChange = (selectedPlace) => {
    if (selectedPlace?.geometry?.location && webViewRef.current) {
      const lat = selectedPlace.geometry.location.lat;
      const lng = selectedPlace.geometry.location.lng;
      webViewRef.current.injectJavaScript(`
        flyToLocation(${lat}, ${lng}, 16);
        true;
      `);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "markerPress") {
        const found = places.find((p) => p.place_id === msg.placeId);
        if (found) {
          handleCarouselItemChange(found);
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: LEAFLET_HTML }}
        style={styles.map}
        onLoadEnd={() => {
          setIsMapReady(true);
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              setUserLocation(${mapRegion.latitude}, ${mapRegion.longitude});
              flyToLocation(${mapRegion.latitude}, ${mapRegion.longitude}, 13);
              if (${JSON.stringify(places)}.length > 0) {
                updatePlaces(${JSON.stringify(places)});
              }
              true;
            `);
          }
        }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* Free Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search city, venue or address..."
          onChangeText={(text) => {
            setSearchQuery(text);
            if (!text) setSearchResults([]);
          }}
          value={searchQuery}
          onSubmitEditing={handleSearchSubmit}
          loading={isSearching}
          style={styles.searchBar}
          inputStyle={{ color: "white" }}
          iconColor="white"
          placeholderTextColor="#8fa3ad"
        />
        {searchResults.length > 0 && (
          <View style={styles.resultsDropdown}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.place_id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Bottom Map Carousel (slider intact) */}
      <View style={styles.carouselWrapper}>
        <MapCarousel
          onCarouselItemChange={handleCarouselItemChange}
          places={places}
        />
      </View>
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
    backgroundColor: "#f4f6f8",
  },
  searchContainer: {
    position: "absolute",
    top: 50,
    width: "90%",
    alignSelf: "center",
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: "#00171F",
    borderRadius: 12,
    elevation: 4,
  },
  resultsDropdown: {
    backgroundColor: "#00171F",
    marginTop: 4,
    borderRadius: 10,
    maxHeight: 200,
    paddingHorizontal: 8,
    elevation: 5,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1a3440",
  },
  resultText: {
    color: "white",
    fontSize: 13,
  },
  carouselWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
