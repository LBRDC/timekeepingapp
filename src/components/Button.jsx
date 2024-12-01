import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

const Button = (props) => {
  return (
    <View style={{ width: "100%" }}>
      <TouchableOpacity style={styles.btn} onPress={props.onClick}>
        <Text style={styles.btnTxt}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#4CAF50",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
