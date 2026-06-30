import ChartComponent from "@/components/home/chart";
import TopProfitTrucks from "@/components/home/top-profit-trucks";
import { APP_COLORS } from "@/constants/colors";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
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
        <View>
          <ChartComponent />
        </View>
        <View>
          <TopProfitTrucks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
