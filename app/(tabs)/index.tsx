import ChartComponent from "@/components/home/chart";
import SummaryCard from "@/components/home/summary-card";
import TopProfitTrucks from "@/components/home/top-profit-trucks";
import { APP_COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import React, {useMemo, useState} from "react";
import {ActivityIndicator, ScrollView, Text, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useTimeBasedGreeting} from "@/hooks/use-time-based-greeting";
import {useTranslation} from "@/hooks/use-translation";
import { CompactSelect } from "@/app/(tabs)/profile/user/components/compact-select";
import {useOwnerLookupOptions} from "@/stores/server/ownership/owner-lookup-query";

const Home = () => {
  const locale = useLocaleStore((state) => state.locale);
  const role = useAuthStore((state) => state.role);
  const fullName = useAuthStore((state) => state.fullName);
  const upperRole = (role || "").toUpperCase();
  const isAdmin = upperRole === "ADMIN";
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);
  const greeting = useTimeBasedGreeting();
  const {tabs:t} = useTranslation('common')
  const home = useTranslation("home");


  const { data: options = [] ,isPending } = useOwnerLookupOptions("",isAdmin);



  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: APP_COLORS.background , flex : 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View className="flex-row items-center justify-between">
        <View className="max-w-[72%]">
          <Text
              className={`text-sm ${mmLeading}`}
              style={[{color: APP_COLORS.textMuted}, style]}
          >
            {greeting}
          </Text>
          <Text
              className={`mt-1 text-lg font-normal ${mmLeading}`}
              style={[style, {color: APP_COLORS.textPrimary}]}
          >
            {fullName}
          </Text>
        </View>
        <Text
            className={`mt-0 text-lg font-bold ${mmLeading}`}
            style={[{color: APP_COLORS.textPrimary}, style]}
        >
          {t.home}
        </Text>
        </View>

        {/* owner select box */}
        {isAdmin ? (
            isPending ? (
                <View className="items-center py-8">
                  <ActivityIndicator color={APP_COLORS.primary} size="small" />
                </View>
            ) : (
                <View>
                  <CompactSelect
                      label={home.ownerIdLabel}
                      value={selectedOwnerId}
                      onChange={setSelectedOwnerId}
                      locale={locale}
                      placeholder={home.ownerIdPlaceholder}
                      options={options}
                  />
                </View>
            )
        ) : null}



        <View>
          <SummaryCard
            selectedOwnerId={isAdmin ? selectedOwnerId : null}
          />
        </View>
        <View>
          <ChartComponent
            selectedOwnerId={isAdmin ? selectedOwnerId : null}
          />
        </View>
        <View>
          <TopProfitTrucks
            selectedOwnerId={isAdmin ? selectedOwnerId : null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
