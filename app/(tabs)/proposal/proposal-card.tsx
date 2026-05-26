import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import type { AppLocale } from "@/stores/client/locale-store";
import type { ProposalItem } from "@/stores/server/proposal/typed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card } from "heroui-native";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type ProposalCardProps = {
  item: ProposalItem;
  locale: AppLocale;
  onPressDetail: (item: ProposalItem) => void;
};

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

export function ProposalCard({ item, locale, onPressDetail }: ProposalCardProps) {
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const [expanded, setExpanded] = useState(false);
  const labels =
    locale === "mm"
      ? {
          amount: "အဆိုပြုငွေ",
          plateNo: "ယာဉ်နံပါတ်",
          serviceShop: "ဆိုင်",
          proposalDate: "အဆိုပြုရက်",
          serviceDate: "ဝန်ဆောင်မှုရက်",
          createdBy: "အဆိုပြုသူ",
          viewDetail: "Detail ကြည့်ရန်",
        }
      : {
          amount: "Amount",
          plateNo: "Plate No",
          serviceShop: "Service Shop",
          proposalDate: "Proposal Date",
          serviceDate: "Service Date",
          createdBy: "Created By",
          viewDetail: "View Detail",
        };

  return (
    <Pressable onPress={() => setExpanded((prev) => !prev)}>
      <Card className="mb-3">
        <Card.Body className="gap-2">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-slate-100">
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color="#64748b"
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-bold text-primary">
                {item.proposalNo}
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500" style={style}>
                {formatDateTime(item.proposalDate)}
              </Text>
            </View>

            <View className="rounded-xl bg-[#edf2f7] px-2 py-1 ">
              <Text className="text-xs font-semibold uppercase tracking-[0.4px] text-slate-600">
                {item.serviceType || "SERVICE"}
              </Text>
            </View>
          </View>

          {expanded ? (
            <View className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-3">
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text
                    className={`text-xs text-slate-500" ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.amount}
                  </Text>
                  <Text
                    className="text-xl font-semibold text-primary"
                    style={style}
                  >
                    {formatAmount(item.proposalAmount)}
                  </Text>
                </View>
                <View className="rounded-xl bg-[#edf2f7] px-3 py-1.5">
                  <Text
                    className={`text-[10px] font-semibold text-slate-600 ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.createdBy}: {item.createdBy || "-"}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`text-xs text-slate-500" ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.plateNo}
                  </Text>
                  <Text
                    className="text-sm font-semibold text-slate-700"
                    style={style}
                  >
                    {item.plateNo || "-"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-xs text-slate-500" ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.serviceShop}
                  </Text>
                  <Text
                    className="text-sm font-semibold text-slate-700"
                    style={style}
                  >
                    {item.serviceShop || "-"}
                  </Text>
                </View>
              </View>

              <View className="mt-2 flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`text-xs text-slate-500" ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.proposalDate}
                  </Text>
                  <Text
                    className="text-sm font-semibold text-slate-700"
                    style={style}
                  >
                    {formatDateTime(item.proposalDate)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-xs text-slate-500" ${getMyanmarLeadingClass(locale)}`}
                  >
                    {labels.serviceDate}
                  </Text>
                  <Text
                    className="text-sm font-semibold text-slate-700"
                    style={style}
                  >
                    {formatDateTime(item.serviceDate)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => onPressDetail(item)}
                className="mt-3 items-center justify-center rounded-xl py-2.5"
                style={{ backgroundColor: "#455c7a" }}
              >
                <Text className="text-xs font-semibold text-white" style={style}>
                  {labels.viewDetail}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Card.Body>
      </Card>
    </Pressable>
  );
}
