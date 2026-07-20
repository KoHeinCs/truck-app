import { APP_COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Tabs, usePathname } from "expo-router";
import React, {useCallback, useMemo} from "react";
import {useTranslation} from "@/hooks/use-translation";

type TabNav = {
  navigate: (name: string, params?: { screen: string }) => void;
};

type TabRoute = {
  name: string;
  state?: { index: number };
};

/** Nested stack မှာ detail စသည် ကျန်ရင် root (index) သို့ပြန်ရှင်း */
function resetTabStack(
  e: { preventDefault: () => void },
  navigation: TabNav,
  route: TabRoute,
) {
  const nested = route.state;
  // Default tab jump က detail ကိုပြန်ခေါ်မယ့်အရင် တားမယ်
  if (nested && nested.index > 0) {
    e.preventDefault();
  }
  navigation.navigate(route.name, { screen: "index" });
}

export default function TabLayout() {

  const token = useAuthStore((state) => state.token);
  const {tabs:t} =  useTranslation('common')
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const hideTabBar = useMemo(()=> {
      const hiddenPrefixes = ["/proposal/","/ownership/","/profile/"];
      const isRootTab = pathname === "/" || pathname === "/ownership" || pathname === '/proposal' || pathname === "/proposal";
      if (isRootTab) return false;
      return hiddenPrefixes.some(prefix => pathname.startsWith(prefix))
  },[pathname]);



  const refreshHome = useCallback(() => {
    void queryClient.resetQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  const refreshOwnership = useCallback(() => {
    void queryClient.resetQueries({ queryKey: ["ownership", "infinite"] });
  }, [queryClient]);

  const refreshProposal = useCallback(() => {
    void queryClient.resetQueries({ queryKey: ["proposal", "infinite"] });
  }, [queryClient]);

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: hideTabBar ? { display: "none" } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel:t.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: refreshHome,
        }}
      />
      <Tabs.Screen
        name="ownership"
        options={{
          title: "Truck",
          tabBarLabel: t.ownership,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            resetTabStack(e, navigation, route);
            refreshOwnership();
          },
        })}
      />
      <Tabs.Screen
        name="proposal"
        options={{
          title: "Proposal",
          tabBarLabel: t.proposal,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            resetTabStack(e, navigation, route);
            refreshProposal();
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: t.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            resetTabStack(e, navigation, route);
          },
        })}
      />
    </Tabs>
  );
}
