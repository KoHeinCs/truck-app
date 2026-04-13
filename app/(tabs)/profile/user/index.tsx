import { APP_COLORS } from "@/constants/colors";
import { myanmarUITextStyle } from "@/constants/myanmar-font";
import profileLocale from "@/locale/profile/profile.json";
import { useLocaleStore } from "@/stores/client/locale-store";
import type { BoolFilter } from "@/stores/server/user/search-columns";
import { useUsersInfinite } from "@/stores/server/user/query";
import type { UserTeamItem } from "@/stores/server/user/typed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Card, Input } from "heroui-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function triValue(current: BoolFilter): BoolFilter {
  if (current === null) return true;
  if (current === true) return false;
  return null;
}

function UserCard({ item, locale }: { item: UserTeamItem; locale: "en" | "mm" }) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;

  return (
    <Card className="mb-3">
      <Card.Body className="px-4 py-3">
        <View className="flex-row items-start justify-between">
          <View className="max-w-[72%]">
            <Text className="text-xl font-bold text-slate-900" style={style}>
              {item.fullName}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">{item.phoneNumber || item.username}</Text>
            <Text className="text-sm text-slate-500">{item.email}</Text>
          </View>
          <View className="rounded-full bg-[#EAF1F8] px-2.5 py-1">
            <Text className="text-xs font-semibold text-[#3F5F87]">{item.role}</Text>
          </View>
        </View>
        <View className="my-3 h-px bg-slate-200" />
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-2">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.active ? "#22c55e" : "#94a3b8" }}
            />
            <Text className="text-sm text-slate-600">{item.active ? "Active" : "Inactive"}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons
              name={item.notLocked ? "lock-open-outline" : "lock-closed-outline"}
              size={16}
              color={item.notLocked ? "#10b981" : "#ef4444"}
            />
            <Text className="text-sm text-slate-600">
              {item.notLocked ? "Unlocked" : "Locked"}
            </Text>
          </View>
        </View>
      </Card.Body>
    </Card>
  );
}

export default function TeamManagementScreen() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const t = profileLocale[locale].teamScreen;
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const [quickQuery, setQuickQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState<BoolFilter>(null);
  const [isNotLocked, setIsNotLocked] = useState<BoolFilter>(null);

  const filters = useMemo(
    () => ({
      quickQuery,
      fullName,
      phoneNumber,
      role,
      email,
      isActive,
      isNotLocked,
    }),
    [email, fullName, isActive, isNotLocked, phoneNumber, quickQuery, role],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
    isRefetching,
  } = useUsersInfinite(filters);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data.data) ?? [],
    [data],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f5f8fc]">
      <View className="flex-row items-center px-4 pb-2 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={22} color={APP_COLORS.primary} />
        </Pressable>
        <Text className="flex-1 px-3 text-center text-xl font-bold text-slate-900" style={style}>
          {t.title}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard item={item} locale={locale} />}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        ListHeaderComponent={
          <View className="px-4 pb-3">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="min-h-12 flex-1 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3">
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                  value={quickQuery}
                  onChangeText={setQuickQuery}
                  placeholder={t.searchPlaceholder}
                  placeholderTextColor="#94a3b8"
                  className="ml-2 mr-1 flex-1 py-2 text-base"
                  style={style}
                />
                <Pressable onPress={() => setQuickQuery("")}>
                  <Ionicons name="close" size={20} color="#94a3b8" />
                </Pressable>
                <Pressable
                  className="ml-2"
                  onPress={() => setAdvancedOpen((v) => !v)}
                >
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={advancedOpen ? APP_COLORS.primary : "#94a3b8"}
                  />
                </Pressable>
              </View>
              <Pressable
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: APP_COLORS.primary }}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </Pressable>
            </View>

            {advancedOpen ? (
              <Card>
                <Card.Body className="gap-3">
                  <Text className="text-base font-semibold text-slate-800" style={style}>
                    {t.advancedTitle}
                  </Text>
                      <View className="gap-2">
                        <Text className="text-xs text-slate-400" style={style}>
                          {t.labels.fullName}
                        </Text>
                        <Input
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder={t.placeholders.fullName}
                        />
                      </View>
                      <View className="gap-2">
                        <Text className="text-xs text-slate-400" style={style}>
                          {t.labels.phoneNumber}
                        </Text>
                        <Input
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholder={t.placeholders.phoneNumber}
                          keyboardType="phone-pad"
                        />
                      </View>
                      <View className="gap-2">
                        <Text className="text-xs text-slate-400" style={style}>
                          {t.labels.role}
                        </Text>
                        <Input
                          value={role}
                          onChangeText={setRole}
                          placeholder={t.placeholders.role}
                          autoCapitalize="characters"
                        />
                      </View>
                      <View className="gap-2">
                        <Text className="text-xs text-slate-400" style={style}>
                          {t.labels.email}
                        </Text>
                        <Input
                          value={email}
                          onChangeText={setEmail}
                          placeholder={t.placeholders.email}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setIsActive(triValue(isActive))}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <Text className="text-xs text-slate-400" style={style}>
                        {t.labels.isActive}
                      </Text>
                      <Text className="mt-1 text-sm text-slate-800" style={style}>
                        {isActive === null
                          ? t.tri.any
                          : isActive
                            ? t.tri.yes
                            : t.tri.no}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setIsNotLocked(triValue(isNotLocked))}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                    >
                      <Text className="text-xs text-slate-400" style={style}>
                        {t.labels.isNotLocked}
                      </Text>
                      <Text className="mt-1 text-sm text-slate-800" style={style}>
                        {isNotLocked === null
                          ? t.tri.any
                          : isNotLocked
                            ? t.tri.yes
                            : t.tri.no}
                      </Text>
                    </Pressable>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => {
                        setIsActive(null);
                        setIsNotLocked(null);
                        setFullName("");
                        setPhoneNumber("");
                        setRole("");
                        setEmail("");
                        setQuickQuery("");
                      }}
                      className="flex-1 items-center rounded-xl bg-slate-100 py-3"
                    >
                      <Text className="font-semibold text-slate-700" style={style}>
                        {t.reset}
                      </Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 items-center rounded-xl py-3"
                      style={{ backgroundColor: APP_COLORS.primary }}
                      onPress={() => setAdvancedOpen(false)}
                    >
                      <Text className="font-semibold text-white" style={style}>
                        {t.apply}
                      </Text>
                    </Pressable>
                  </View>
                </Card.Body>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <View className="items-center py-10">
              <ActivityIndicator color={APP_COLORS.primary} />
            </View>
          ) : (
            <Text className="px-6 py-8 text-center text-slate-500" style={style}>
              {t.empty}
            </Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={APP_COLORS.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={APP_COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}
