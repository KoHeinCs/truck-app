import { APP_COLORS } from "@/constants/colors";
import { myanmarUITextStyle } from "@/constants/myanmar-font";
import profileLocale from "@/locale/profile/profile.json";
import { useLocaleStore } from "@/stores/client/locale-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Card } from "heroui-native";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { key: "mm" as const, short: "မြ", english: "Myanmar" },
  { key: "en" as const, short: "En", english: "English" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const t = profileLocale[locale];

  return (
    <SafeAreaView className="flex-1 bg-[#f5f8fc]">
      <View className="px-4 pb-3 pt-1">
        <Pressable
          onPress={() => router.navigate("/profile")}
          className="flex-row items-center gap-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Ionicons name="chevron-back" size={20} color="#0f172a" />
          </View>
          <Text
            className="text-lg font-bold text-slate-900"
            style={textStyle}
          >
            {t.languagePageTitle}
          </Text>
        </Pressable>
      </View>

      <View className="px-4">
        <Card className=" p-2">
          <Card.Body className="p-0">
            {LANGUAGES.map((item, index) => {
              const active = locale === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setLocale(item.key)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? APP_COLORS.primarySoft : "#fff",
                    borderBottomWidth: index < LANGUAGES.length - 1 ? 1 : 0,
                    borderBottomColor: "#e5e7eb",
                  })}
                >
                  <View className="flex-row items-center gap-3 px-4 py-3">
                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <Text
                        className="text-sm font-bold text-slate-700"
                        style={textStyle}
                      >
                        {item.short}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-slate-900"
                        style={textStyle}
                      >
                        {item.key === "mm"
                          ? t.languageMyanmar
                          : t.languageEnglish}
                      </Text>
                      <Text
                        className="text-sm text-slate-500"
                        style={textStyle}
                      >
                        {item.english}
                      </Text>
                    </View>
                    {active ? (
                      <View
                        className="h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: APP_COLORS.primary }}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </Card.Body>
        </Card>
      </View>
    </SafeAreaView>
  );
}
