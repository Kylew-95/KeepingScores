import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../SupabaseConfig/SupabaseClient";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export const PRESET_HEADERS = [
  {
    id: "mountains",
    title: "Foggy Mountains",
    uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
  },
  {
    id: "stadium",
    title: "Night Arena",
    uri: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
  },
  {
    id: "court",
    title: "Sports Court",
    uri: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
  },
  {
    id: "gradient",
    title: "Blue Wave",
    uri: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  },
];

export default function UpdateHeaderImage({
  profileData,
  setProfileData,
  session,
}) {
  const [loading, setLoading] = useState(false);

  const saveHeaderUrl = async (headerUrl) => {
    try {
      await AsyncStorage.setItem("user_header_image_url", headerUrl);

      const uid = session?.user?.id || profileData?.userprofile_id;
      if (uid) {
        try {
          await supabase
            .from("UserProfileData")
            .update({ header_image_url: headerUrl })
            .eq("userprofile_id", uid);
        } catch (e) {
          // If column doesn't exist in Supabase, AsyncStorage still persists it!
        }
      }

      if (setProfileData) {
        setProfileData((prev) => ({
          ...prev,
          header_image_url: headerUrl,
        }));
      }
      Alert.alert("Success", "Profile header background updated!");
    } catch (err) {
      console.error("Error saving header:", err);
    }
  };

  const pickHeaderImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to choose a header image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const img = result.assets[0];

        try {
          const uid = session?.user?.id || profileData?.userprofile_id || "user";
          const base64 = await FileSystem.readAsStringAsync(img.uri, {
            encoding: "base64",
          });
          const decodedData = decode(base64);
          const filePath = `headers/${uid}_${Date.now()}.png`;

          await supabase.storage
            .from("avatar-images")
            .upload(filePath, decodedData, { contentType: "image/png", upsert: true });

          const publicURL = supabase.storage
            .from("avatar-images")
            .getPublicUrl(filePath);

          const finalUrl = publicURL?.data?.publicUrl || img.uri;
          await saveHeaderUrl(finalUrl);
        } catch (storageErr) {
          // If storage upload fails, fallback to saving local URI in AsyncStorage
          await saveHeaderUrl(img.uri);
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error picking header image:", err);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        icon="image"
        loading={loading}
        disabled={loading}
        onPress={pickHeaderImage}
        style={styles.pickButton}
        labelStyle={{ fontWeight: "700" }}
      >
        Choose Custom Photo
      </Button>

      <Text style={styles.presetHeading}>Or Choose a Preset Theme:</Text>
      <View style={styles.presetRow}>
        {PRESET_HEADERS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.presetItem}
            onPress={() => saveHeaderUrl(p.uri)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: p.uri }} style={styles.presetThumbnail} />
            <Text style={styles.presetTitle} numberOfLines={1}>
              {p.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pickButton: {
    backgroundColor: "#2193F0",
    borderRadius: 8,
    alignSelf: "center",
    width: 220,
  },
  presetHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 16,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  presetItem: {
    flex: 1,
    alignItems: "center",
  },
  presetThumbnail: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetTitle: {
    fontSize: 10,
    color: "#334155",
    marginTop: 4,
    textAlign: "center",
  },
});
