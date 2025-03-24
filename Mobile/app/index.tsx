import { Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      testID="mainIndex"
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
};

export default HomeScreen;
