import { SimpleMarkdown } from "@/components/auth/simple-markdown";
import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { fetchTermsMarkdown } from "@/constants/terms";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/stores/client/locale-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Card } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const tProfile = useTranslation("profile");
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetchTermsMarkdown().then((content) => {
      if (cancelled) return;
      setMarkdown(content);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: APP_COLORS.background , flex : 1}}
    >
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={() => router.navigate("/profile")}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className={`flex-1 px-3 text-center text-lg ${mmLeading} font-bold`}
          style={[textStyle, { color: APP_COLORS.textPrimary }]}
        >
          {tProfile.termsPageTitle}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Card
          style={{
            backgroundColor: APP_COLORS.card,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          <Card.Body className="p-4">
            {loading ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color={APP_COLORS.primary} />
              </View>
            ) : (
              <SimpleMarkdown
                content={markdown}
                textStyle={textStyle}
                mmLeading={mmLeading}
              />
            )}
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
