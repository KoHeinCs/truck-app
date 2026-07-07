import {useTranslation} from "@/hooks/use-translation";
import {useLogin} from "@/stores/server/login/mutation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Card, Input, Spinner} from "heroui-native";
import React, {useMemo, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {z} from "zod";
import {getMyanmarLeadingClass, myanmarUITextStyle} from "@/constants/myanmar-font";
import {useLocaleStore} from "@/stores/client/locale-store";
import {APP_COLORS} from "@/constants/colors";
import {Feather, Ionicons} from "@expo/vector-icons";
import type {AppLocale} from "@/stores/client/locale-store";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";

function buildSchema(locale: "en" | "mm") {
    return z.object({
        username: z.string()
            .min(1, locale === 'mm' ? "အကောင့်လိုအပ်သည်" : "Username is required"),
        password: z.string()
            .min(1, locale === "mm" ? "စကားဝှက်လိုအပ်သည်" : "Password is required")
    })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

const LOCALE_OPTIONS: AppLocale[] = ["en", "mm"];

export default function LoginScreen() {
    const t = useTranslation("login");
    const errorCatalog = useTranslation("error");
    const locale = useLocaleStore((state) => state.locale);
    const setLocale = useLocaleStore((state) => state.setLocale);
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const textStyle = locale === "mm" ? mmTextStyle : undefined;


    const {mutate, isPending} = useLogin();
    const {control, handleSubmit, formState: {errors},} = useForm<FormValues>({
        resolver: zodResolver(buildSchema(locale)),
        defaultValues: {
            username: "HHA09455733730",
            password: "Ashwetaw@ger123",
        },
    });

    const onSubmit = (values: FormValues) => {
        mutate(values, {
            onError: (err: unknown) => {
                const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
                    title: t.errorTitle,
                    message: t.errorBody,
                });
                Alert.alert(title, message);
            },
        });
    };

    const [showPassword, setShowPassword] = useState(false);
    const [localeMenuOpen, setLocaleMenuOpen] = useState(false);

    const handleSelectLocale = (option: AppLocale) => {
        setLocale(option);
        setLocaleMenuOpen(false);
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: APP_COLORS.background}}>
            {localeMenuOpen ? (
                <Pressable
                    style={[StyleSheet.absoluteFillObject, {zIndex: 5}]}
                    onPress={() => setLocaleMenuOpen(false)}
                />
            ) : null}

            <View className="items-end px-5 pt-1" style={{zIndex: 10}}>
                <Pressable
                    onPress={() => setLocaleMenuOpen((prev) => !prev)}
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={({pressed}) => ({
                        backgroundColor: pressed
                            ? APP_COLORS.primarySoft
                            : APP_COLORS.card,
                        borderColor: APP_COLORS.border,
                        borderWidth: 1,
                    })}
                >
                    <Ionicons
                        name="globe-outline"
                        size={20}
                        color={APP_COLORS.primary}
                    />
                </Pressable>

                {localeMenuOpen ? (
                    <View
                        className="absolute right-5 top-12 min-w-[120px] overflow-hidden rounded-xl"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                            shadowColor: "#000",
                            shadowOffset: {width: 0, height: 4},
                            shadowOpacity: 0.12,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        {LOCALE_OPTIONS.map((option, index) => {
                            const active = locale === option;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => handleSelectLocale(option)}
                                    style={({pressed}) => ({
                                        backgroundColor: pressed
                                            ? APP_COLORS.primarySoft
                                            : "transparent",
                                        borderBottomWidth:
                                            index < LOCALE_OPTIONS.length - 1 ? 1 : 0,
                                        borderBottomColor: APP_COLORS.border,
                                    })}
                                >
                                    <View className="flex-row items-center justify-between px-4 py-3">
                                        <Text
                                            className="text-sm font-semibold uppercase"
                                            style={{
                                                color: active
                                                    ? APP_COLORS.primary
                                                    : APP_COLORS.textPrimary,
                                            }}
                                        >
                                            {option}
                                        </Text>
                                        {active ? (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={APP_COLORS.primary}
                                            />
                                        ) : null}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                ) : null}
            </View>
            <KeyboardAvoidingView
                style={{flex: 1, justifyContent: "center", paddingHorizontal: 20}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Card className="gap-4"
                      style={{
                          backgroundColor: APP_COLORS.card,
                          borderColor: APP_COLORS.border,
                          borderWidth: 1
                      }}
                >
                    <Card.Header className="pb-0">
                        <Card.Title
                            className={`text-base font-bold ${getMyanmarLeadingClass(locale)}`}
                            style={[{color: APP_COLORS.textPrimary}, textStyle]}
                        >
                            {t.title}
                        </Card.Title>
                        <Card.Description
                            className={`text-sm font-semibold ${getMyanmarLeadingClass(locale)}`}
                            style={[{color: APP_COLORS.textPrimary}, textStyle]}>
                            {t.description}
                        </Card.Description>
                    </Card.Header>

                    <Card.Body className="gap-3">
                        <View className="gap-2">
                            <Text className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                  style={[{color: APP_COLORS.textSecondary}, textStyle]}>
                                {t.username}
                            </Text>
                            <Controller
                                control={control}
                                name="username"
                                render={({field: {onChange, value}}) => (
                                    <Input
                                        value={value}
                                        onChangeText={onChange}
                                        className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                        placeholder={t.placeholders.username}
                                        placeholderTextColor={APP_COLORS.textMuted}
                                        autoCapitalize="none"
                                        style={[{
                                            backgroundColor: APP_COLORS.inputBackground,
                                            borderColor: errors.username ? APP_COLORS.error : APP_COLORS.border,
                                            borderWidth: 1,
                                            color: APP_COLORS.textPrimary
                                        },textStyle]}
                                    />
                                )}
                            />
                            {!!errors.username?.message ? (
                                <Text
                                    className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                                    style={[{color: APP_COLORS.error}, textStyle]}
                                >
                                    {errors.username.message}
                                </Text>
                            ) : null}
                        </View>

                        <View className="gap-2">

                            <Text className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                  style={[{color: APP_COLORS.textSecondary}, textStyle]}>
                                {t.password}
                            </Text>

                            <Controller
                                control={control}
                                name="password"
                                render={({field: {onChange, value}}) => (
                                    <View style={{position: "relative", justifyContent: "center"}}>

                                        <Input
                                            value={value}
                                            className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                            onChangeText={onChange}
                                            placeholder={t.placeholders.password}
                                            placeholderTextColor={APP_COLORS.textMuted}
                                            autoCapitalize="none"
                                            secureTextEntry={!showPassword}
                                            style={[{
                                                backgroundColor: APP_COLORS.inputBackground,
                                                borderColor: errors.password ? APP_COLORS.error : APP_COLORS.border,
                                                borderWidth: 1,
                                                color: APP_COLORS.textPrimary,
                                                paddingRight: 45
                                            },textStyle]}

                                        />
                                        <Pressable
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={({pressed}) => ({
                                                position: 'absolute',
                                                right: 12,
                                                width: 32,
                                                padding: 4,
                                                opacity: pressed ? 0.75 : 1
                                            })}
                                        >
                                            <Feather name={showPassword ? 'eye-off' : 'eye'} size={22}
                                                     color={APP_COLORS.textMuted}/>
                                        </Pressable>


                                    </View>

                                )}
                            />
                            {!!errors.password?.message ? (
                                <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)}`}
                                      style={[{color: APP_COLORS.error}, textStyle]}
                                >
                                    {errors.password.message}
                                </Text>
                            ) : null}
                        </View>
                    </Card.Body>

                    <Card.Footer className="pt-0">
                        <Button
                            onPress={handleSubmit(onSubmit)}
                            isDisabled={isPending}
                            className={`w-full ${getMyanmarLeadingClass(locale)}`}
                            animation={{
                                highlight: {
                                    backgroundColor: {
                                        value: APP_COLORS.primaryPressed, // Safely injects #456385 on click!
                                    }
                                },
                            }}
                            style={{
                                backgroundColor: APP_COLORS.primary
                            }}
                        >
                            {isPending ? (
                                <Spinner size="sm" color="white"/>
                            ) : (
                                <Text className={`text-sm ${getMyanmarLeadingClass(locale)} font-bold`}
                                      style={[{color: "#FFFFFF"}]}>{t.login}</Text>
                            )}
                        </Button>
                    </Card.Footer>
                </Card>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
