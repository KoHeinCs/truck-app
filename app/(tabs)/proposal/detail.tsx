import { APP_COLORS } from "@/constants/colors";
import { myanmarUITextStyle } from "@/constants/myanmar-font";
import proposalLocale from "@/locale/proposal/proposal.json";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useProposalDetail } from "@/stores/server/proposal/query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDateTime(value: string): string {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = String(parsed.getFullYear());
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatAmount(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toLocaleString()} Ks`;
}

export default function ProposalDetailScreen() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const t = proposalLocale[locale];
  const params = useLocalSearchParams<{ proposalNo?: string; ownershipId?: string }>();
  const proposalNo = String(params.proposalNo ?? "").trim();
  const ownershipId = String(params.ownershipId ?? "").trim();
  const { data, isPending } = useProposalDetail(proposalNo, ownershipId);
  const detail = data?.data;

  const labels =
    locale === "mm"
      ? {
          title: "အဆိုပြုချက်အသေးစိတ်",
          amount: "အဆိုပြုငွေ",
          serviceShop: "ဆိုင်",
          proposalDate: "အဆိုပြုရက်",
          serviceDate: "ဝန်ဆောင်မှုရက်",
          createdBy: "အဆိုပြုသူ",
          owner: "ပိုင်ရှင်",
          description: "ဖော်ပြချက်",
          status: "အခြေအနေ",
        }
      : {
          title: "Proposal Detail",
          amount: "Amount",
          serviceShop: "Service Shop",
          proposalDate: "Proposal Date",
          serviceDate: "Service Date",
          createdBy: "Created By",
          owner: "Owner",
          description: "Description",
          status: "Status",
        };

  return (
    <SafeAreaView className="flex-1 bg-[#f3f7fb]">
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-[#eef2f6]"
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text className="flex-1 px-3 text-center text-[24px] font-bold text-slate-900" style={style}>
          {labels.title}
        </Text>
        <View className="h-11 w-11" />
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={APP_COLORS.primary} />
        </View>
      ) : (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="rounded-2xl bg-white p-4">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-primary">{detail?.proposalNo || "-"}</Text>
                <Text className="mt-1 text-sm text-slate-500" style={style}>
                  {detail?.plateNo || "-"}
                </Text>
              </View>
              <View className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5">
                <Text className="text-xs font-semibold uppercase text-rose-700" style={style}>
                  {detail?.status || "-"}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.amount}
                </Text>
                <Text className="text-2xl font-bold text-primary" style={style}>
                  {formatAmount(Number(detail?.proposalAmount ?? 0))}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.serviceShop}
                </Text>
                <Text className="text-sm font-semibold text-slate-700" style={style}>
                  {detail?.serviceShop || "-"}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.proposalDate}
                </Text>
                <Text className="text-sm font-semibold text-slate-700" style={style}>
                  {formatDateTime(detail?.proposalDate || "")}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.serviceDate}
                </Text>
                <Text className="text-sm font-semibold text-slate-700" style={style}>
                  {formatDateTime(detail?.serviceDate || "")}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.createdBy}
                </Text>
                <Text className="text-sm font-semibold text-slate-700" style={style}>
                  {detail?.createdUserFullName || detail?.createdBy || "-"}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-500" style={style}>
                  {labels.owner}
                </Text>
                <Text className="text-sm font-semibold text-slate-700" style={style}>
                  {detail?.ownerFullName || "-"}
                </Text>
              </View>
              <View className="h-px bg-slate-200" />
              <View>
                <Text className="mb-1 text-xs text-slate-500" style={style}>
                  {labels.description}
                </Text>
                <Text className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3 text-sm text-slate-700" style={style}>
                  {detail?.description || "-"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
