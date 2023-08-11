import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_AUTH, SUPABASE_KEY } from "@env";

export const supabase = createClient(SUPABASE_AUTH, SUPABASE_KEY);
