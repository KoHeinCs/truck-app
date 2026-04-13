import React from "react";
import { Text, View } from "react-native";

const Home = () => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-5">
      <Text className="text-2xl font-bold text-slate-800">Home Screen</Text>
      <Text className="mt-2 text-sm text-slate-600">
        Login success ပြီးရင် ဒီ screen ကိုဝင်လာပါမယ်။
      </Text>
    </View>
  );
};

export default Home;
