import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useTruckByPlateNo } from "@/stores/server/truck/query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { type Href, useRouter } from "expo-router";
import { Button, Input } from "heroui-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PLATE_RE = /^[0-9A-Z]{2}-[0-9]{4}$/;

export default function OwnershipSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((state) => state.locale);
  const { searchOwnership: t } = useTranslation("ownership");

  const [plateInput, setPlateInput] = useState("");
  const [activePlate, setActivePlate] = useState("");

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const {
    data: truck,
    isFetching,
    isFetched,
  } = useTruckByPlateNo(activePlate, !!activePlate);

  useEffect(() => {
    if (!activePlate || isFetching || !isFetched) return;

    if (truck) {
      router.push(
        `/(tabs)/ownership/create?source=search&plateNo=${encodeURIComponent(activePlate)}` as Href,
      );
      setActivePlate("");
      return;
    }

    Alert.alert(t.notFoundTitle, t.notFoundBody);
    setActivePlate("");
  }, [activePlate, isFetching, isFetched, truck, router, t]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onManualEntry = useCallback(() => {
    router.push("/(tabs)/ownership/create?source=manual" as Href);
  }, [router]);

  const onSearch = useCallback(() => {
    const normalized = plateInput.trim().toUpperCase();
    if (!PLATE_RE.test(normalized)) {
      Alert.alert(t.invalidPlateTitle, t.invalidPlateBody);
      return;
    }
    setActivePlate(normalized);
  }, [plateInput, t]);

  const isSearching = isFetching && !!activePlate;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: APP_COLORS.background }}
    >
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
          style={[style, { color: APP_COLORS.textPrimary }]}
        >
          {t.title}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          flexGrow: 1,
        }}
      >
        <View
          className="mb-4 flex-row gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: APP_COLORS.primarySoft,
            borderColor: APP_COLORS.primary,
          }}
        >
          <Ionicons
            name="information-circle"
            size={22}
            color={APP_COLORS.primary}
            style={{ marginTop: 2 }}
          />
          <Text
            className={`flex-1 text-sm ${mmLeading}`}
            style={[style, { color: APP_COLORS.textSecondary }]}
          >
            {t.infoText}
          </Text>
        </View>

        <View
          className="rounded-2xl p-4"
          style={{
            backgroundColor: APP_COLORS.card,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
          }}
        >
          <View className="gap-3">
            <Text
              className={`text-sm font-medium ${mmLeading}`}
              style={[style, { color: APP_COLORS.textSecondary }]}
            >
              {t.plateLabel}
            </Text>

            <View className="relative">
              <Input
                value={plateInput}
                onChangeText={(value) => setPlateInput(value.toUpperCase())}
                placeholder={t.platePlaceholder}
                placeholderTextColor={APP_COLORS.textMuted}
                autoCapitalize="characters"
                editable={!isSearching}
                style={[
                  {
                    backgroundColor: APP_COLORS.inputBackground,
                    borderColor: APP_COLORS.primary,
                    borderWidth: 1,
                    color: APP_COLORS.textPrimary,
                    paddingLeft: 40,
                  },
                  style,
                ]}
                className={`h-12 py-0 text-sm font-medium ${mmLeading}`}
              />
              <View className="absolute left-3 top-0 h-12 justify-center">
                <Ionicons name="search" size={18} color={APP_COLORS.textMuted} />
              </View>
            </View>

            <Button
              onPress={onSearch}
              isDisabled={isSearching}
              className={`items-center justify-center rounded-xl ${mmLeading}`}
              style={{ backgroundColor: APP_COLORS.primary }}
            >
              {isSearching ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text
                    className={`text-sm font-bold text-white ${mmLeading}`}
                    style={style}
                  >
                    {t.searching}
                  </Text>
                </View>
              ) : (
                <Text
                  className={`text-sm font-bold text-white ${mmLeading}`}
                  style={style}
                >
                  {t.searchButton}
                </Text>
              )}
            </Button>
          </View>
        </View>

        <View className="my-5 flex-row items-center">
          <View
            className="flex-1"
            style={{ height: 1, backgroundColor: APP_COLORS.border }}
          />
          <Text
            className="mx-3 text-sm"
            style={[
              style,
              {
                color: APP_COLORS.textMuted,
                backgroundColor: APP_COLORS.background,
              },
            ]}
          >
            {t.or}
          </Text>
          <View
            className="flex-1"
            style={{ height: 1, backgroundColor: APP_COLORS.border }}
          />
        </View>

        <Button
          onPress={onManualEntry}
          isDisabled={isSearching}
          variant="outline"
          className={`items-center justify-center rounded-xl border ${mmLeading}`}
          style={{
            backgroundColor: APP_COLORS.card,
            borderColor: APP_COLORS.primary,
            borderWidth: 1,
          }}
        >
          <Text
            className={`text-sm font-bold ${mmLeading}`}
            style={[style, { color: APP_COLORS.primary }]}
          >
            {t.manualButton}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
