import { APP_COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import {Redirect, Tabs, usePathname} from "expo-router";
import React, {useCallback, useMemo} from "react";
import {useTranslation} from "@/hooks/use-translation";

export default function TabLayout() {

  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  const {tabs:t} =  useTranslation('common')
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isWorker = role === 'WORKER';

  const hideTabBar = useMemo(()=> {

      const hiddenPrefixes = ["/proposal/","/ownership/","/profile/"];
      const rootTabs = ["/", "/ownership", "/proposal", "/profile"];
      if (rootTabs.includes(pathname)) return false;
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
      backBehavior={isWorker ? "history" : "order"}
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
          href: isWorker ? null : undefined,
          title: "Home",
          tabBarLabel:t.home,
          popToTopOnBlur:true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          )
        }}
        listeners={() => ({
            tabPress: () => {
                refreshHome();
            },
        })}
      />
      <Tabs.Screen
        name="ownership"
        options={{
          href: isWorker ? null : undefined,
          title: "Truck",
          tabBarLabel: t.ownership,
          popToTopOnBlur:true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={size} color={color} />
          )
        }}
        listeners={() => ({
          tabPress: () => {
            refreshOwnership();
          },
        })}
      />
      <Tabs.Screen
        name="proposal"
        options={{
          title: "Proposal",
          tabBarLabel: t.proposal,
          popToTopOnBlur:true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          )
        }}
        listeners={() => ({
          tabPress: (e) => {
            refreshProposal();
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: t.profile,
          popToTopOnBlur:true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
