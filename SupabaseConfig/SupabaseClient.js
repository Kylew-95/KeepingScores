import React, { useState, useEffect } from "react";
import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

export const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_AUTH;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(url, key, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default function SupabaseClient() {
  const [user, setUser] = useState(supabase.auth.getUser());
  const handleAuthChange = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    const { data: authListener } =
      supabase.auth.onAuthStateChange(handleAuthChange);
    return () => {
      authListener.unsubscribe();
    };
  }, []);
  return <></>;
}
