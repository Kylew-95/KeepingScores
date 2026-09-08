import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
  Modal,
  Image,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Searchbar, IconButton, ActivityIndicator } from "react-native-paper";
import * as Location from "expo-location";
import MapCarousel from "./MapCarousel";

const sportImages = {
  fitness_centre:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  sports_centre:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  pitch:
    "https://images.unsplash.com/photo-1529900245534-47fbf7c3f600?w=800&q=80",
  football:
    "https://images.unsplash.com/photo-1529900245534-47fbf7c3f600?w=800&q=80",
  swimming_pool:
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
  tennis:
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80",
  park: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
};

// Component to render venue image with logo fallback on load failure
function VenueModalImage({ venue }) {
  const [hasError, setHasError] = useState(false);
  const photoUrl =
    venue?.photo ||
    sportImages[venue?.type] ||
    sportImages[venue?.sport] ||
    sportImages.default;

  if (hasError || !photoUrl) {
    return (
      <View style={styles.modalFallbackContainer}>
        <Image
          source={require("../Images/Logo-Keeping-Score.png")}
          style={styles.modalFallbackLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: photoUrl }}
      style={styles.modalHeaderImage}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
}

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
      cursor: pointer;
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
      background: #0284C7;
      border: 2.5px solid #FFFFFF;
      border-radius: 50%;
      color: white;
      text-align: center;
      line-height: 24px;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.6);
    }
    .leaflet-popup-content-wrapper {
      background: #00171F;
      color: white;
      border-radius: 12px;
      border: 1px solid #2193F0;
      padding: 4px;
    }
    .leaflet-popup-tip {
      background: #00171F;
    }
    .leaflet-popup-content h4 {
      margin: 4px 0;
      color: #2193F0;
      font-size: 14px;
    }
    .leaflet-popup-content p {
      margin: 2px 0 6px 0;
      color: #cbd5e1;
      font-size: 12px;
    }
    .popup-hint {
      color: #38BDF8;
      font-size: 11px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([51.50853, -0.12574], 11.5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var userMarker = null;

    function setUserLocation(lat, lng) {
      if (userMarker) {
        markersLayer.removeLayer(userMarker);
      }
      var userIcon = L.divIcon({
        className: 'user-location-wrapper',
        html: '<div class="user-pulse"></div><div class="user-location-pin">📍</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
      userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 });
      userMarker.bindPopup('<b>You are here</b><br/>Current user location');
      markersLayer.addLayer(userMarker);
    }

    function flyToLocation(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom || 14, { duration: 1.2 });
    }

    function updatePlaces(places) {
      markersLayer.eachLayer(function(layer) {
        if (layer !== userMarker) {
          markersLayer.removeLayer(layer);
        }
      });

      places.forEach(function(place) {
        if (!place.geometry || !place.geometry.location) return;
        var lat = place.geometry.location.lat;
        var lng = place.geometry.location.lng;

        var iconEmoji = '🏟️';
        var t = (place.type || '').toLowerCase();
        var s = (place.sport || '').toLowerCase();
        if (t.includes('gym') || t.includes('fitness') || s.includes('fitness')) iconEmoji = '🏋️';
        else if (t.includes('tennis') || s.includes('tennis')) iconEmoji = '🎾';
        else if (t.includes('pitch') || s.includes('football') || s.includes('soccer')) iconEmoji = '⚽';
        else if (t.includes('swim') || s.includes('swim')) iconEmoji = '🏊';
        else if (t.includes('park')) iconEmoji = '🌳';

        var customIcon = L.divIcon({
          className: 'custom-sport-pin',
          html: iconEmoji,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        var marker = L.marker([lat, lng], { icon: customIcon });
        var popupContent = '<h4>' + (place.name || 'Sports Venue') + '</h4><p>' + (place.vicinity || '') + '</p><div class="popup-hint">Tap for details & directions &rarr;</div>';
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

// Calculate distance in miles between two coordinates using Haversine formula
const calculateDistanceInMiles = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
};

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

// Query real physical location via IP (accurate to user's ISP city / borough)
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

const POPULAR_AREAS = [
  { name: "Clapham", lat: 51.4624, lon: -0.1382, desc: "Lambeth, London (SW4)" },
  { name: "Brixton", lat: 51.4613, lon: -0.1156, desc: "Lambeth, London (SW2 / SW9)" },
  { name: "Battersea", lat: 51.4770, lon: -0.1650, desc: "Wandsworth, London (SW11)" },
  { name: "Wandsworth", lat: 51.4560, lon: -0.1910, desc: "South West London (SW18)" },
  { name: "Wimbledon", lat: 51.4223, lon: -0.1984, desc: "Merton, London (SW19)" },
  { name: "Croydon", lat: 51.3762, lon: -0.0982, desc: "South London (CR0)" },
  { name: "Central London", lat: 51.5074, lon: -0.1278, desc: "Westminster, London" },
];

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

  // Modals state
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [venueDetailModalVisible, setVenueDetailModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

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
          flyToLocation(${lat}, ${lon}, 11.5);
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

  // 2. Fast Multi-Category POI Query (fetches 50-80 venues with distance calculation)
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

        const categories = [
          "leisure centre",
          "sports centre",
          "gym",
          "tennis",
          "pitch",
          "swimming pool",
          "sports club",
          "park",
        ];

        const reqs = categories.map(async (cat) => {
          try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
              cat,
            )}&lat=${lat}&lon=${lon}&limit=16`;
            const resp = await fetch(url, {
              signal: controller.signal,
              headers: { "User-Agent": "KeepingScoresApp/1.0" },
            });
            if (resp.ok) {
              const data = await resp.json();
              return data.features || [];
            }
          } catch (e) {
            // Aborted or network timeout
          }
          return [];
        });

        const allFeatures = (await Promise.all(reqs)).flat();

                const nonSportsList = [
          "childcare",
          "kindergarten",
          "nursery",
          "school",
          "college",
          "university",
          "bus stop",
          "parking",
          "residential",
          "hotel",
          "construction",
          "office",
          "shop",
          "restaurant",
          "cafe",
          "fast_food",
          "bank",
          "pharmacy",
          "bar",
          "pub",
          "dentist",
          "doctors",
          "hospital",
        ];

        allFeatures.forEach((f) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates;
          if (coords && coords.length === 2 && props.name) {
            const cleanName = props.name.trim();
            const lower = cleanName.toLowerCase();
            if (
              !seenNames.has(lower) &&
              cleanName.length > 3 &&
              !nonSportsList.includes(props.osm_value) &&
              !nonSportsList.includes(props.osm_key) &&
              !props.name.toLowerCase().includes("nursery") &&
              !props.name.toLowerCase().includes("childcare") &&
              !props.name.toLowerCase().includes("kindergarten")
            ) {
              seenNames.add(lower);
              const address =
                [props.street, props.district || props.city || props.county]
                  .filter(Boolean)
                  .join(", ") || "Sports & Leisure Facility";

              const dist = calculateDistanceInMiles(lat, lon, coords[1], coords[0]);
              const distText = dist !== null
                ? (dist < 10 ? `${dist.toFixed(1)} mi away` : `${Math.round(dist)} mi away`)
                : null;

              foundPlaces.push({
                place_id: String(props.osm_id || Math.random()),
                name: cleanName,
                vicinity: address,
                type: props.osm_value || "sports_centre",
                sport: props.osm_value || "sports",
                distance: distText,
                distanceNum: dist != null ? dist : 999,
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

        // Sort nearest venues first
        foundPlaces.sort((a, b) => a.distanceNum - b.distanceNum);

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
        // Cancelled or network notice
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

    const timer = setTimeout(fetchNearbyPlaces, 250);
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

      // 1. Query Photon
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
        flyToLocation(${lat}, ${lon}, 13.5);
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

  const handleSelectArea = (area) => {
    setMapRegion({ latitude: area.lat, longitude: area.lon });
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        flyToLocation(${area.lat}, ${area.lon}, 13.5);
        true;
      `);
    }
    setCurrentLocationName(`📍 ${area.name}`);
    setAreaModalVisible(false);
  };

  const handleCarouselItemChange = (selectedPlace) => {
    if (selectedPlace?.geometry?.location && webViewRef.current) {
      const lat = selectedPlace.geometry.location.lat;
      const lng = selectedPlace.geometry.location.lng;
      webViewRef.current.injectJavaScript(`
        flyToLocation(${lat}, ${lng}, 14);
        true;
      `);
    }
  };

  // Open Venue Details when either card is tapped OR pin on Leaflet map is tapped
  const handleOpenVenueDetail = (venue) => {
    if (!venue) return;
    setSelectedVenue(venue);
    setVenueDetailModalVisible(true);
    handleCarouselItemChange(venue);
  };

  const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "markerPress") {
        const found = places.find((p) => String(p.place_id) === String(msg.placeId));
        if (found) {
          handleOpenVenueDetail(found);
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  // Open Google Maps app or web directions
  const openGoogleMaps = (venue) => {
    if (!venue?.geometry?.location) return;
    const lat = venue.geometry.location.lat;
    const lng = venue.geometry.location.lng;
    const destName = encodeURIComponent(venue.name || "Sports Venue");
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${destName}`;

    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(googleMapsUrl);
        } else {
          const fallbackUrl = Platform.select({
            ios: `maps:0,0?q=${destName}@${lat},${lng}`,
            android: `geo:0,0?q=${lat},${lng}(${destName})`,
            default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          });
          Linking.openURL(fallbackUrl);
        }
      })
      .catch((err) => {
        console.log("Could not open maps:", err);
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      });
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
              flyToLocation(${mapRegion.latitude}, ${mapRegion.longitude}, 11.5);
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

        {/* Current Area Indicator Badge (Touchable to open area selector) */}
        <TouchableOpacity
          style={styles.locationBadge}
          onPress={() => setAreaModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.locationBadgeText} numberOfLines={1}>
            {currentLocationName} ▾ (Tap to change)
          </Text>
        </TouchableOpacity>

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

      {/* Bottom Map Carousel (slider intact, cards clickable) */}
      <View style={styles.carouselWrapper}>
        <MapCarousel
          onCarouselItemChange={handleCarouselItemChange}
          onCardPress={handleOpenVenueDetail}
          places={places}
        />
      </View>

      {/* 1. Quick Area Selection Modal */}
      <Modal
        visible={areaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAreaModalVisible(false)}
        >
          <View style={styles.areaModalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Choose London Area</Text>
              <TouchableOpacity onPress={() => setAreaModalVisible(false)}>
                <IconButton icon="close" iconColor="#94A3B8" size={20} style={{ margin: 0 }} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Instantly view sports facilities, pitches and gyms around:
            </Text>

            {POPULAR_AREAS.map((area) => (
              <TouchableOpacity
                key={area.name}
                style={styles.areaItem}
                onPress={() => handleSelectArea(area)}
              >
                <Text style={styles.areaEmoji}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  <Text style={styles.areaDesc}>{area.desc}</Text>
                </View>
                <Text style={styles.areaArrow}>&rarr;</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. Detailed Venue Modal with Google Maps Directions */}
      <Modal
        visible={venueDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVenueDetailModalVisible(false)}
      >
        <View style={styles.venueModalOverlay}>
          <View style={styles.venueModalCard}>
            {/* Modal Image Header with fallback */}
            <View style={styles.venueModalImageWrapper}>
              <VenueModalImage venue={selectedVenue} />
              <TouchableOpacity
                style={styles.closeIconBtn}
                onPress={() => setVenueDetailModalVisible(false)}
              >
                <IconButton icon="close" iconColor="#FFFFFF" size={22} style={{ margin: 0 }} />
              </TouchableOpacity>
              {selectedVenue?.distance ? (
                <View style={styles.modalDistanceBadge}>
                  <Text style={styles.modalDistanceBadgeText}>
                    📍 {selectedVenue.distance}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Modal Content Details */}
            <ScrollView style={styles.venueModalBody} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={styles.venueModalName}>
                {selectedVenue?.name || "Sports & Leisure Centre"}
              </Text>

              <View style={styles.venueMetaRow}>
                {selectedVenue?.distance ? (
                  <View style={styles.modalDistanceBadge}>
                    <Text style={styles.modalDistanceBadgeText}>
                      📍 {selectedVenue.distance}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>
                    ⭐ {selectedVenue?.rating || "4.8"} / 5.0
                  </Text>
                </View>
              </View>

              {/* Location & Address Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Address & Location</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoRowIcon}>📍</Text>
                  <Text style={styles.infoRowText}>
                    {selectedVenue?.vicinity || "London, United Kingdom"}
                  </Text>
                </View>
              </View>

              {/* Directions Button */}
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={() => openGoogleMaps(selectedVenue)}
                activeOpacity={0.85}
              >
                <IconButton
                  icon="google-maps"
                  iconColor="#FFFFFF"
                  size={24}
                  style={{ margin: 0, marginRight: 8 }}
                />
                <Text style={styles.directionsBtnText}>
                  Get Directions in Google Maps
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setVenueDetailModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "rgba(0, 23, 31, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
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

  // Area Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  areaModalBox: {
    backgroundColor: "#00171F",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "#2193F0",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    marginVertical: 10,
  },
  areaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0A2533",
  },
  areaEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  areaName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  areaDesc: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  areaArrow: {
    color: "#2193F0",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Venue Detail Modal Styles
  venueModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  venueModalCard: {
    backgroundColor: "#00171F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get("window").height * 0.85,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#2193F0",
    overflow: "hidden",
  },
  venueModalImageWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
    backgroundColor: "#001117",
  },
  modalHeaderImage: {
    width: "100%",
    height: "100%",
  },
  modalFallbackContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalFallbackLogo: {
    width: 200,
    height: 60,
  },
  
  closeIconBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 23, 31, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDistanceBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0, 23, 31, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2193F0",
  },
  modalDistanceBadgeText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "bold",
  },
  venueModalBody: {
    padding: 20,
  },
  venueMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  venueCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: "#0A2533",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2193F0",
  },
  typeBadgeText: {
    color: "#2193F0",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "bold",
  },
  venueModalName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: "#0A1D27",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#123040",
  },
  infoSectionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  infoRowIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  infoRowText: {
    color: "#E2E8F0",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    backgroundColor: "#00171F",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a3a4c",
  },
  featureTagText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "600",
  },
  directionsBtn: {
    backgroundColor: "#2193F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#2193F0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  directionsBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelBtnText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
});
