import ChartComponent from "@/components/home/chart";
import DashboardOwnerSelect from "@/components/home/dashboard-owner-select";
import SummaryCard from "@/components/home/summary-card";
import TopProfitTrucks from "@/components/home/top-profit-trucks";
import { APP_COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const role = useAuthStore((state) => state.role);
  const upperRole = (role || "").toUpperCase();
  const showOwnerSelect = upperRole === "ADMIN";
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

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
        {showOwnerSelect ? (
          <View>
            <DashboardOwnerSelect
              value={selectedOwnerId}
              onChange={setSelectedOwnerId}
            />
          </View>
        ) : null}
        <View>
          <SummaryCard
            selectedOwnerId={showOwnerSelect ? selectedOwnerId : null}
          />
        </View>
        <View>
          <ChartComponent
            selectedOwnerId={showOwnerSelect ? selectedOwnerId : null}
          />
        </View>
        <View>
          <TopProfitTrucks
            selectedOwnerId={showOwnerSelect ? selectedOwnerId : null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
