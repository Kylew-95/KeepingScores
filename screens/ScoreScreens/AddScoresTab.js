import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { List } from "react-native-paper";
import { sportsList } from "../../SupabaseConfig/SportsList&Forms";
import { useNavigation } from "@react-navigation/native";

export default function AddScoresTab() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const navigation = useNavigation();

  // This is for when Im ready to add more Drop downs for each form
  // const matchFormOptions = sportsList.filter(
  //   (sport) => sport.Form === "Match Form"
  // );
  // const items = matchFormOptions.map((sport) => ({
  //   label: sport.name,
  //   value: sport.id,
  //   form: sport.Form,
  // }));

  const items = sportsList.map((sport) => ({
    label: sport.name,
    value: sport.id,
    form: sport.Form,
  }));

  const handleItemSelected = (selectedItem) => {
    try {
      setValue(selectedItem.value);
      navigation.navigate(selectedItem.form);
      console.log(selectedItem);
    } catch (error) {
      console.log(error);
    } finally {
      setOpen(false);
      setValue("select a sport");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <List.Section>
        <List.Item title="Match Form" />
      </List.Section>

      <View style={styles.dropDownContainer}>
        <DropDownPicker
          searchable={true}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          theme="DARK"
          mode="SIMPLE"
          placeholder="Pick a Sport"
          searchContainerStyle={{ height: 50 }}
          containerStyle={{ height: 50, width: 300, alignSelf: "center" }}
          dropDownDirection="AUTO"
          maxHeight={550}
          modalAnimationType="fade"
          listMode="MODAL"
          selectedItemContainerStyle={{ backgroundColor: "#2193F0" }}
          onSelectItem={(item) => {
            handleItemSelected(item);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  dropDownContainer: {
    marginTop: 10, // Adjust this value as needed
  },
});
