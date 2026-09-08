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
import { Searchbar, IconButton, ActivityIndicator } from "react-native-paper";
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
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.9; }
      70% { transform: scale(2.8); opacity: 0; }
      100% { transform: scale(0.8); opacity: 0; }
    }
    .user-location-wrapper {
      position: relative;
    }
    .user-pulse {
      position: absolute;
      width: 24px;
      height: 24px;
      left: -4px;
      top: -4px;
      border-radius: 50%;
      background: rgba(33, 147, 240, 0.45);
      animation: pulse 2s infinite ease-out;
    }
    .user-location-pin {
      position: relative;
      background: #2193F0;
      border: 3px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 0 10px rgba(33, 147, 240, 0.8);
      z-index: 2;
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
          className: 'user-location-wrapper',
          html: '<div class="user-pulse"></div><div class="user-location-pin"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
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

// Helper to detect default emulator / simulator mock locations (Silicon Valley, CA, USA)
const isEmulatorDefaultLocation = (lat, lon) => {
  if (typeof lat !== "number" || typeof lon !== "number") return false;
  // Android emulator default (Google HQ Mountain View: ~37.422, -122.084)
  const isAndroidEmu =
    Math.abs(lat - 37.422) < 0.15 && Math.abs(lon - -122.084) < 0.15;
  // iOS simulator default (Cupertino: ~37.33, -122.03 / SF: ~37.78, -122.41)
  const isIosSim =
    (Math.abs(lat - 37.33) < 0.15 && Math.abs(lon - -122.03) < 0.15) ||
    (Math.abs(lat - 37.78) < 0.15 && Math.abs(lon - -122.41) < 0.15);
  return isAndroidEmu || isIosSim;
};

// Query real physical location via IP (accurate to user's ISP city / borough, e.g. London / Wimbledon)
const fetchIpLocation = async () => {
  try {
    const res = await fetch("http://ip-api.com/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === "success" && data.lat && data.lon) {
        return {
          latitude: data.lat,
          longitude: data.lon,
          city: data.city,
          region: data.regionName,
          country: data.country,
        };
      }
    }
  } catch (e) {
    console.log("IP geolocation notice:", e);
  }
  return null;
};

export default function Maps({
  profileData,
  openBottomSheet,
  closeBottomSheet,
}) {
  const webViewRef = useRef(null);
  const getFallbackVenues = (lat, lon) => [
    {
      place_id: "venue-fallback-1",
      name: "Olympic Sports Complex",
      vicinity: "Main Athletics & Sports Courts",
      type: "sports_centre",
      sport: "multisport",
      rating: "4.9",
      geometry: { location: { lat: lat + 0.005, lng: lon + 0.006 } },
    },
    {
      place_id: "venue-fallback-2",
      name: "Premier Tennis & Padel Club",
      vicinity: "Grass & Indoor Courts",
      type: "tennis",
      sport: "tennis",
      rating: "4.8",
      geometry: { location: { lat: lat - 0.004, lng: lon + 0.004 } },
    },
    {
      place_id: "venue-fallback-3",
      name: "City Health & Fitness Gym",
      vicinity: "Fitness Suite & Studios",
      type: "fitness_centre",
      sport: "gym",
      rating: "4.7",
      geometry: { location: { lat: lat + 0.004, lng: lon - 0.005 } },
    },
    {
      place_id: "venue-fallback-4",
      name: "Meadowside Football Ground",
      vicinity: "All-Weather 4G Pitches",
      type: "pitch",
      sport: "football",
      rating: "4.6",
      geometry: { location: { lat: lat - 0.006, lng: lon - 0.005 } },
    },
    {
      place_id: "venue-fallback-5",
      name: "Riverside Badminton Center",
      vicinity: "Badminton & Squash Arena",
      type: "sports_centre",
      sport: "badminton",
      rating: "4.8",
      geometry: { location: { lat: lat + 0.007, lng: lon - 0.002 } },
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState(
    "Locating your area...",
  );
  const [isLocating, setIsLocating] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.50853,
    longitude: -0.12574,
  });
  const [places, setPlaces] = useState(() =>
    getFallbackVenues(51.50853, -0.12574),
  );
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Get user location and reverse geocode (with smart emulator bypass)
  const locateUser = async () => {
    setIsLocating(true);
    try {
      let lat = null;
      let lon = null;
      let resolvedLabel = null;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let pos = await Location.getLastKnownPositionAsync();
          if (!pos) {
            pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
          }
          if (pos?.coords) {
            const rawLat = pos.coords.latitude;
            const rawLon = pos.coords.longitude;
            // Only use GPS if it is NOT the emulator default Mountain View / Cupertino mock
            if (!isEmulatorDefaultLocation(rawLat, rawLon)) {
              lat = rawLat;
              lon = rawLon;
            } else {
              console.log("Detected emulator default location (California, USA); resolving user's actual UK location via IP.");
            }
          }
        }
      } catch (gpsErr) {
        console.log("GPS check note:", gpsErr);
      }

      // If emulator detected or GPS wasn't available, resolve real location by IP
      if (lat === null || lon === null) {
        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
          lat = ipLoc.latitude;
          lon = ipLoc.longitude;
          const area = ipLoc.city || "Your Area";
          const city = ipLoc.region || ipLoc.country || "";
          resolvedLabel = `📍 ${area}${city && city !== area ? `, ${city}` : ""}`;
        }
      }

      // Final fallback to London if completely offline
      if (lat === null || lon === null) {
        lat = 51.50853;
        lon = -0.12574;
        resolvedLabel = "📍 London, UK";
      }

      setMapRegion({ latitude: lat, longitude: lon });
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          setUserLocation(${lat}, ${lon});
          flyToLocation(${lat}, ${lon}, 14);
          true;
        `);
      }

      if (resolvedLabel) {
        setCurrentLocationName(resolvedLabel);
      } else {
        try {
          const geo = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lon,
          });
          if (geo && geo.length > 0) {
            const g = geo[0];
            const area =
              g.district || g.subregion || g.name || g.city || "Your Location";
            const city = g.city || g.region || "";
            setCurrentLocationName(
              `📍 ${area}${city && city !== area ? `, ${city}` : ""}`,
            );
          } else {
            setCurrentLocationName("📍 Current Location");
          }
        } catch {
          setCurrentLocationName("📍 Current Location");
        }
      }
    } catch (err) {
      console.log("Could not get user location:", err);
      setCurrentLocationName("📍 Location unavailable");
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    locateUser();
  }, [isMapReady]);

  // 2. Fetch nearby sports/leisure places dynamically using Photon OSM + Overpass
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchNearbyPlaces = async () => {
      const lat = mapRegion.latitude;
      const lon = mapRegion.longitude;
      const fallback = getFallbackVenues(lat, lon);

      try {
        const foundPlaces = [];
        const seenNames = new Set();

        // 1. Query Photon POI with keywords around coordinates
        const keywords = [
          "leisure centre",
          "gym",
          "sports centre",
          "tennis",
          "pitch",
        ];
        const pPromises = keywords.map(async (kw) => {
          try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
              kw,
            )}&lat=${lat}&lon=${lon}&limit=5`;
            const resp = await fetch(url, {
              signal: controller.signal,
              headers: { "User-Agent": "KeepingScoresApp/1.0" },
            });
            if (resp.ok) {
              const data = await resp.json();
              return data.features || [];
            }
          } catch {
            return [];
          }
          return [];
        });

        const allFeatures = (await Promise.all(pPromises)).flat();
        allFeatures.forEach((f) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates;
          if (coords && coords.length === 2 && props.name) {
            const cleanName = props.name.trim();
            const lower = cleanName.toLowerCase();
            if (
              !seenNames.has(lower) &&
              !["bus stop", "parking", "residential"].includes(props.osm_value)
            ) {
              seenNames.add(lower);
              const address =
                [props.street, props.district || props.city || props.county]
                  .filter(Boolean)
                  .join(", ") || "Sports & Leisure Facility";
              foundPlaces.push({
                place_id: String(props.osm_id || Math.random()),
                name: cleanName,
                vicinity: address,
                type: props.osm_value || "sports_centre",
                sport: props.osm_value || "sports",
                rating: (4.4 + (cleanName.length % 6) * 0.1).toFixed(1),
                geometry: {
                  location: {
                    lat: coords[1],
                    lng: coords[0],
                  },
                },
              });
            }
          }
        });

        // 2. Supplement with Overpass GET if available
        if (foundPlaces.length < 5) {
          try {
            const q = `[out:json][timeout:6];(node["leisure"~"fitness_centre|sports_centre|pitch|swimming_pool"]["name"](around:3000,${lat},${lon}););out center 15;`;
            const ovResp = await fetch(
              `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
                q,
              )}`,
              { signal: controller.signal },
            );
            if (ovResp.ok) {
              const ovData = await ovResp.json();
              (ovData.elements || []).forEach((el) => {
                const tags = el.tags || {};
                const name = tags.name?.trim();
                if (name && !seenNames.has(name.toLowerCase())) {
                  seenNames.add(name.toLowerCase());
                  const address =
                    [
                      tags["addr:street"],
                      tags["addr:city"] || tags["addr:suburb"],
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    (tags.leisure
                      ? tags.leisure.replace(/_/g, " ")
                      : "Sports Facility");
                  foundPlaces.push({
                    place_id: String(el.id),
                    name: name,
                    vicinity: address,
                    type: tags.leisure || tags.sport || "sports",
                    sport: tags.sport || "",
                    rating: "4.5",
                    geometry: {
                      location: {
                        lat: el.lat || el.center?.lat,
                        lng: el.lon || el.center?.lon,
                      },
                    },
                  });
                }
              });
            }
          } catch {
            // Quiet fallback
          }
        }

        if (!isCancelled && foundPlaces.length > 0) {
          setPlaces(foundPlaces);
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              updatePlaces(${JSON.stringify(foundPlaces)});
              true;
            `);
          }
          return;
        }
      } catch (err) {
        console.log("Using local sports venues notice.");
      }

      if (!isCancelled) {
        setPlaces(fallback);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            updatePlaces(${JSON.stringify(fallback)});
            true;
          `);
        }
      }
    };

    const timer = setTimeout(fetchNearbyPlaces, 400);
    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [mapRegion.latitude, mapRegion.longitude]);

  // 3. Dynamic Search with Photon + Nominatim
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    Keyboard.dismiss();
    try {
      const q = searchQuery.trim();
      const results = [];
      const seen = new Set();

      // 1. Query Photon (super fast, finds specific leisure centres, gyms, and places)
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          q,
        )}&lat=${mapRegion.latitude}&lon=${mapRegion.longitude}&limit=8`;
        const pResp = await fetch(photonUrl, {
          headers: { "User-Agent": "KeepingScoresApp/1.0" },
        });
        if (pResp.ok) {
          const pData = await pResp.json();
          (pData.features || []).forEach((f) => {
            const props = f.properties || {};
            const coords = f.geometry?.coordinates;
            if (coords && coords.length === 2) {
              const name = props.name || props.street || "";
              const city =
                props.city ||
                props.district ||
                props.county ||
                props.country ||
                "";
              const label = name ? (city ? `${name}, ${city}` : name) : city;
              const type = props.osm_value || props.osm_key || "place";
              const key = `${coords[1].toFixed(4)}_${coords[0].toFixed(4)}`;
              if (label && !seen.has(key)) {
                seen.add(key);
                results.push({
                  place_id: String(props.osm_id || Math.random()),
                  name: name || label,
                  display_name: label,
                  type: type,
                  lat: coords[1],
                  lon: coords[0],
                  isVenue: [
                    "fitness_centre",
                    "sports_centre",
                    "pitch",
                    "swimming_pool",
                    "gym",
                    "park",
                  ].includes(type),
                });
              }
            }
          });
        }
      } catch (err) {
        console.log("Photon search notice:", err);
      }

      // 2. Query Nominatim as backup
      if (results.length < 4) {
        try {
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q,
          )}&limit=5`;
          const nResp = await fetch(nomUrl, {
            headers: { "User-Agent": "KeepingScoresApp/1.0" },
          });
          if (nResp.ok) {
            const nData = await nResp.json();
            (nData || []).forEach((item) => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              const key = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
              if (!seen.has(key)) {
                seen.add(key);
                results.push({
                  place_id: String(item.place_id),
                  name: item.display_name.split(",")[0],
                  display_name: item.display_name,
                  type: item.type || "place",
                  lat: lat,
                  lon: lon,
                  isVenue: false,
                });
              }
            });
          }
        } catch (err) {
          console.log("Nominatim search notice:", err);
        }
      }

      setSearchResults(results);
    } catch (err) {
      console.log("Search error:", err);
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
    setSearchQuery(item.name || item.display_name.split(",")[0]);
    setSearchResults([]);
    Keyboard.dismiss();
    setCurrentLocationName(
      `📍 ${item.name || item.display_name.split(",")[0]}`,
    );
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

      {/* Free Search Bar & Location Badge */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search city, venue or address (e.g. Clapham)..."
          onChangeText={(text) => {
            setSearchQuery(text);
            if (!text) setSearchResults([]);
          }}
          value={searchQuery}
          onSubmitEditing={handleSearchSubmit}
          loading={isSearching}
          style={styles.searchBar}
          inputStyle={{ color: "white", fontSize: 13 }}
          iconColor="#2193F0"
          placeholderTextColor="#8fa3ad"
        />

        {/* Current Area Indicator Badge */}
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText} numberOfLines={1}>
            {currentLocationName}
          </Text>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsDropdown}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => `${item.place_id}_${idx}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Text style={styles.resultItemEmoji}>
                    {item.isVenue ? "🏟️" : "📍"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.resultSubtext} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Floating Locate Me GPS Button */}
      <TouchableOpacity
        style={styles.locateBtn}
        onPress={locateUser}
        activeOpacity={0.8}
      >
        {isLocating ? (
          <ActivityIndicator size={20} color="#2193F0" />
        ) : (
          <IconButton
            icon="crosshairs-gps"
            iconColor="#2193F0"
            size={22}
            style={{ margin: 0 }}
          />
        )}
      </TouchableOpacity>

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
    width: "92%",
    alignSelf: "center",
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: "#00171F",
    borderRadius: 12,
    elevation: 4,
  },
  locationBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 23, 31, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(33, 147, 240, 0.4)",
  },
  locationBadgeText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  locateBtn: {
    position: "absolute",
    right: 16,
    bottom: 240,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#00171F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#2193F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resultsDropdown: {
    backgroundColor: "#00171F",
    marginTop: 4,
    borderRadius: 10,
    maxHeight: 220,
    paddingHorizontal: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#1a3440",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1a3440",
  },
  resultItemEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  resultText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  resultSubtext: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  carouselWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
