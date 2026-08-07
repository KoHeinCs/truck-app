import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {HeroUINativeProvider} from "heroui-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";
import {DEFAULT_QUERY} from '@/constants/query-times'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime:DEFAULT_QUERY.DEFAULT , // Keep data fresh for 5 mins to prevent spamming
            gcTime: DEFAULT_QUERY.DEFAULT_GC, // Keep in garbage collection cache for 10 minutes
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    },
});

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{flex: 1}}>
                <HeroUINativeProvider>
                    <Stack screenOptions={{headerShown: false}}>

                        <Stack.Screen name="(tabs)"/>

                        <Stack.Screen
                            name="ownership/detail"
                            options={{
                                presentation: 'card',
                                headerShown: false,
                                title: 'Ownership Details',
                                gestureEnabled: true,
                                animation: 'slide_from_right',
                            }}
                        />

                        <Stack.Screen
                            name="ownership/edit/[id]"
                            options={{
                                presentation: 'card',
                                headerShown: false,
                                title: 'Ownership Edit',
                                gestureEnabled: true,
                                animation: 'slide_from_right',
                            }}
                        />

                        <Stack.Screen
                            name="proposal/detail"
                            options={{
                                presentation: 'card',
                                headerShown: false,
                                title: 'Proposal Details',
                                gestureEnabled: true,
                                animation: 'slide_from_right',
                            }}
                        />

                        <Stack.Screen
                            name="proposal/edit"
                            options={{
                                presentation: 'card',
                                headerShown: false,
                                title: 'Proposal Edit',
                                gestureEnabled: true,
                                animation: 'slide_from_right',
                            }}
                        />

                    </Stack>
                    <StatusBar style="dark"/>
                </HeroUINativeProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
