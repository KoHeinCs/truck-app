import {APP_COLORS} from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import {useTranslation} from "@/hooks/use-translation";
import {getApiErrorAlertCopy} from "@/lib/api-error-alert";
import {useLocaleStore} from "@/stores/client/locale-store";
import {useOwnerLookupOptions} from "@/stores/server/ownership/owner-lookup-query";
import {useUserDetail} from "@/stores/server/user/query";
import type {CreateUserRole} from "@/stores/server/user/create-mutation";
import {
    useUpdateUserActiveStatus,
    useUpdateUserLockStatus,
} from "@/stores/server/user/status-mutation";
import {useUpdateUser} from "@/stores/server/user/update-mutation";
import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Input, Select, Switch} from "heroui-native";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {z} from "zod";
import {toIsoDate, parseDmyToDate} from "@/utils/dateUtil"


function isoToDmy(isoDate: string): string {
    const raw = isoDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!match) return "";
    return `${match[3]}/${match[2]}/${match[1]}`;
}

function todayIsoLocal(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function isNotFutureDate(dmy: string): boolean {
    const iso = toIsoDate(dmy);
    if (!iso) return false;
    return iso <= todayIsoLocal();
}

function isRole(value: string): value is CreateUserRole {
    return ["ADMIN", "OWNER", "WORKER", "VIEWER"].includes(value);
}

function toDmyDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
}

function buildSchema(locale: "en" | "mm") {
    return z.object({
        version: z
            .number()
            .int()
            .min(0, locale === "mm" ? "Version မမှန်ကန်ပါ" : "Version must be >= 0"),
        fullName: z
            .string()
            .min(1, locale === "mm" ? "အမည်လိုအပ်သည်" : "Full name is required")
            .max(100, locale === "mm" ? "အမည်သည် စာလုံး ၁၀၀ ထက်မကျော်ရပါ" : "Full name cannot exceed 100 characters"),

        email: z
            .string()
            .max(100, locale === "mm" ? "အီးမေးလ်သည် စာလုံး ၁၀၀ ထက်မကျော်ရပါ" : "Email cannot exceed 100 characters")
            .email(locale === "mm" ? "အီးမေးလ်မှန်ကန်ရမည်" : "Invalid email"),
        role: z.enum(["ADMIN", "OWNER", "WORKER", "VIEWER"]),
        joinDate: z
            .string()
            .min(1, locale === "mm" ? "စတင်နေ့စွဲလိုအပ်သည်" : "Join date is required")
            .refine((value) => !!toIsoDate(value), {
                message: locale === "mm" ? "နေ့/လ/နှစ် ပုံစံ dd/mm/yyyy ထည့်ပါ" : "Use dd/mm/yyyy"
            })
            .refine((value) => isNotFutureDate(value), {
                message: locale === "mm" ? "စတင်နေ့စွဲသည် အနာဂတ်နေ့ မဖြစ်ရပါ" : "Join date cannot be in the future",
            }),
        phoneNumber: z
            .string()
            .min(1, locale === "mm" ? "ဖုန်းနံပါတ်လိုအပ်သည်" : "Phone number is required")
            .regex(
                /^09\d{9}$/,
                locale === "mm"
                    ? "၀၉ ဖြင့်စပြီး ဂဏန်း ၉ လုံး ဖြစ်ရမည် (ဥပမာ- 09111222333)"
                    : "Phone number must start with 09 followed by exactly 9 digits (e.g., 09111222333)"
            ),
        dateOfBirth: z
            .string()
            .min(1, locale === "mm" ? "မွေးသက္ကရာဇ်လိုအပ်သည်" : "Date is required")
            .refine((value) => !!toIsoDate(value), {
                message:
                    locale === "mm" ? "နေ့/လ/နှစ် ပုံစံ dd/mm/yyyy ထည့်ပါ" : "Use dd/mm/yyyy",
            })
            .refine((value) => isNotFutureDate(value), {
                message:
                    locale === "mm"
                        ? "မွေးနေ့သက္ကရာဇ်သည် အနာဂတ်နေ့ မဖြစ်ရပါ"
                        : "Date of birth cannot be in the future",
            }),
        fullIdNo: z.string()
            .max(50, locale === "mm" ? "မှတ်ပုံတင်နံပါတ်သည် စာလုံး ၅၀ ထက်မကျော်ရပါ" : "Full ID number cannot exceed 50 characters")
            .optional(),
        parentOwnerId: z.string().optional(),
    })
        .superRefine((data, ctx) => {
            if (data.role === "VIEWER" && !String(data.parentOwnerId ?? "").trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        locale === "mm"
                            ? "စာရင်းစစ်ဆေးသူ ရာထူးအတွက် ယာဉ်ပိုင်ရှင်ကို ရွေးချယ်ပေးပါ"
                            : "Owner In-Check role requires an OWNER.",
                    path: ["parentOwnerId"],
                });
            }
        });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function TeamEditUserScreen() {

    const {updateUser: t} = useTranslation('user');
    const tLookup = useTranslation('lookup')
    const locale = useLocaleStore((state) => state.locale);
    const router = useRouter();
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        id?: string;
        fullName?: string;
        email?: string;
        phoneNumber?: string;
        role?: string;
        active?: string;
        notLocked?: string;
    }>();


    const errorCatalog = useTranslation("error");
    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;
    const {mutate, isPending} = useUpdateUser();
    const {mutate: mutateActiveStatus, isPending: isActiveUpdating} = useUpdateUserActiveStatus();
    const {mutate: mutateLockStatus, isPending: isLockUpdating} = useUpdateUserLockStatus();
    const userId = String(params.id ?? "").trim();
    const {data: userDetailRes, isPending: isUserDetailLoading} = useUserDetail(userId);
    const [activeDateField, setActiveDateField] = useState<"joinDate" | "dateOfBirth" | null>(null,);
    const [isActiveEnabled, setIsActiveEnabled] = useState(String(params.active ?? "true").toLowerCase() === "true",);
    const [isUnlockedEnabled, setIsUnlockedEnabled] = useState(String(params.notLocked ?? "true").toLowerCase() === "true",);
    const {data: ownerOptions = []} = useOwnerLookupOptions("");
    const roleFromParams = isRole(String(params.role ?? "")) ? params.role : "OWNER";
    const schema = useMemo(() => buildSchema(locale), [locale]);
    const androidMmInputProps = Platform.OS === "android" && locale === "mm" ? {includeFontPadding: false as const} : {};

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            version: 0,
            fullName: String(params.fullName ?? ""),
            email: String(params.email ?? ""),
            role: roleFromParams as CreateUserRole,
            phoneNumber: String(params.phoneNumber ?? ""),
            joinDate: isoToDmy(todayIsoLocal()),
            dateOfBirth: "",
            fullIdNo: "",
            parentOwnerId: "",
        },
    });
    const selectedRole = watch("role");
    const roleFilterOptions = useMemo(() => {
        return [
            ...Object.entries(tLookup.roles || {}).map(([key, localizedValue]) => ({
                value: key,
                label: localizedValue
            }))
        ];
    }, [tLookup.roles])


    useEffect(() => {
        const detail = userDetailRes?.data;
        if (!detail) return;
        reset({
            version: Number(detail.version ?? 0),
            fullName: String(detail.fullName ?? ""),
            email: String(detail.email ?? ""),
            role: isRole(String(detail.role ?? "")) ? (detail.role as CreateUserRole) : "OWNER",
            joinDate: detail.joinDate ? isoToDmy(String(detail.joinDate)) : isoToDmy(todayIsoLocal()),
            phoneNumber: String(detail.phoneNumber ?? ""),
            dateOfBirth: detail.dateOfBirth ? isoToDmy(String(detail.dateOfBirth)) : "",
            fullIdNo: String(detail.fullIdNo ?? ""),
            parentOwnerId: String(detail.parentOwnerId ?? ""),
        });
        setIsActiveEnabled(Boolean(detail.active));
        setIsUnlockedEnabled(Boolean(detail.notLocked));
    }, [reset, userDetailRes]);

    const onSubmit = (values: FormValues) => {
        const id = String(params.id ?? "").trim();
        if (!id) {
            Alert.alert(t.errorTitle, t.userInvalid);
            return;
        }

        const dateOfBirthIso = toIsoDate(values.dateOfBirth);
        const joinDateIso = toIsoDate(values.joinDate);
        if (!dateOfBirthIso || !joinDateIso) {
            Alert.alert(t.errorTitle, t.dateInvalid);
            return;
        }

        mutate(
            {
                id,
                version: Number(values.version ?? 0),
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                role: values.role,
                joinDate: joinDateIso,
                phoneNumber: values.phoneNumber.trim(),
                dateOfBirth: dateOfBirthIso,
                fullIdNo: values.fullIdNo?.trim(),
                parentOwnerId: values.role === "VIEWER" ? values.parentOwnerId?.trim() : undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert(t.successTitle, t.successBody);
                    router.back();
                },
                onError: (err: unknown) => {
                    const {title, message} = getApiErrorAlertCopy(err, errorCatalog, {
                        title: t.errorTitle,
                        message: t.errorBody,
                    });
                    Alert.alert(title, message);
                },
            },
        );
    };

    const onToggleActive = (nextStatus: boolean) => {
        const id = String(params.id ?? "").trim();
        if (!id) {
            Alert.alert(t.errorTitle, t.userInvalid);
            return;
        }
        const message = nextStatus ? t.accountActiveMsg : t.accountInactiveMsg;
        Alert.alert(t.statusTitle, message, [
            {text: t.confirmCancel, style: "cancel"},
            {
                text: t.confirmOk,
                onPress: () => {
                    mutateActiveStatus(
                        {id, status: nextStatus},
                        {
                            onSuccess: () => setIsActiveEnabled(nextStatus),
                            onError: () => Alert.alert(t.errorTitle, t.errorBody),
                        },
                    );
                },
            },
        ]);
    };

    const onToggleLocked = (nextStatus: boolean) => {
        const id = String(params.id ?? "").trim();
        if (!id) {
            Alert.alert(t.errorTitle, t.userInvalid);
            return;
        }
        const message = nextStatus ? t.accountUnlockMsg : t.accountLockMsg;
        Alert.alert(t.accountLockTitle, message, [
            {text: t.confirmCancel, style: "cancel"},
            {
                text: t.confirmOk,
                onPress: () => {
                    mutateLockStatus(
                        {id, status: nextStatus},
                        {
                            onSuccess: () => setIsUnlockedEnabled(nextStatus),
                            onError: () => Alert.alert(t.errorTitle, t.errorBody),
                        },
                    );
                },
            },
        ]);
    };

    const onBack = useCallback(() => {
        qc.invalidateQueries({queryKey: ["users"]});
        router.back();
    }, [qc, router]);

    return (
        <SafeAreaView style={{backgroundColor: APP_COLORS.background, flex: 1}}>
            <View className="flex-row items-center px-4 pb-3 pt-1">
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={({pressed}) => ({
                        backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background
                    })}
                >
                    <Ionicons name="arrow-back" size={22} color="#475569"/>
                </Pressable>
                <Text
                    className={`flex-1 px-3 text-center text-lg font-bold ${getMyanmarLeadingClass(locale)}`}
                    style={[style, {color: APP_COLORS.textPrimary}]}
                >
                    {t.title}
                </Text>
                <View className="h-11 w-11"/>
            </View>

            {isUserDetailLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={APP_COLORS.primary}/>
                </View>
            ) : (
                <ScrollView
                    className="px-4"
                    contentContainerStyle={{paddingBottom: insets.bottom + 80, flexGrow: 1}}
                >
                    {/* warning section */}
                    <View
                        className="rounded-2xl border p-3"
                        style={{
                            backgroundColor: APP_COLORS.warningSoft,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        }}
                    >
                        <View className="flex-row items-start gap-2">
                            <Ionicons
                                name="information-circle-outline"
                                size={18}
                                color="#325f99"
                            />
                            <View className="flex-1">
                                <Text
                                    className={`text-sm font-semibold ${getMyanmarLeadingClass(locale)} text-[#325f99]`}
                                    style={style}
                                >
                                    {t.infoTitle}
                                </Text>
                                <Text
                                    className={`mt-0.5 text-xs font-normal ${getMyanmarLeadingClass(locale)} text-[#325f99]`}
                                    style={style}
                                >
                                    {t.infoBody}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* edit form section */}
                    <View
                        className="mt-4 rounded-2xl p-4"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        }}
                    >
                        <View className="gap-3">
                            {/* fullName , email , phoneNumber and fullIdNo  section */}
                            {(
                                [
                                    {key: "fullName", required: true, keyboardType: undefined},
                                    {key: "email", required: true, keyboardType: "email-address"},
                                    {key: "phoneNumber", required: true, keyboardType: "numeric"},
                                    {key: "fullIdNo", required: false, keyboardType: undefined},
                                ] as const
                            ).map((field) => (
                                <View className="gap-1.5" key={field.key}>
                                    <View className="flex-row items-center gap-1">
                                        <Text
                                            className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                            style={[{color: APP_COLORS.textSecondary}, style]}
                                        >
                                            {t.labels[field.key]}
                                        </Text>
                                    </View>
                                    <Controller
                                        control={control}
                                        name={field.key}
                                        render={({field: {onChange, value}}) => (
                                            <Input
                                                value={String(value ?? "")}
                                                onChangeText={onChange}
                                                placeholder={t.placeholders[field.key]}
                                                placeholderTextColor={APP_COLORS.textMuted}
                                                keyboardType={field.keyboardType}
                                                autoCapitalize={field.key === "email" ? "none" : "sentences"}
                                                style={[{
                                                    backgroundColor: APP_COLORS.inputBackground,
                                                    borderColor: errors[field.key] ? APP_COLORS.error : APP_COLORS.border,
                                                    borderWidth: 1,
                                                    color: APP_COLORS.textPrimary
                                                }, style]}
                                                className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                                {...androidMmInputProps}
                                            />
                                        )}
                                    />
                                    {!!errors[field.key]?.message && (
                                        <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                                              style={[{color: APP_COLORS.error}, style]}>
                                            {String(errors[field.key]?.message)}
                                        </Text>
                                    )}
                                </View>
                            ))}

                            {/* Join Date section */}
                            <View className="gap-1.5">
                                <View className="flex-row items-center gap-1">
                                    <Text
                                        className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                        style={[{color: APP_COLORS.textSecondary}, style]}
                                    >
                                        {t.labels.joinDate}
                                    </Text>
                                </View>
                                <Controller
                                    control={control}
                                    name="joinDate"
                                    render={({field: {onChange, value}}) => (
                                        <View>
                                            <Pressable
                                                onPress={() => setActiveDateField("joinDate")}
                                                className={`flex-row items-center h-14 justify-between rounded-xl  px-3 py-3`}
                                                style={{
                                                    backgroundColor: APP_COLORS.inputBackground,
                                                    borderColor: errors.joinDate ? APP_COLORS.error : APP_COLORS.border,
                                                    borderWidth: 1
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                                    style={[style, {color: value ? APP_COLORS.textPrimary : APP_COLORS.textMuted}]}
                                                >
                                                    {value || t.placeholders.joinDate}
                                                </Text>
                                                <Ionicons name="calendar-outline" size={22} color="#64748b"/>
                                            </Pressable>

                                            {activeDateField === "joinDate" ? (
                                                <View className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
                                                    <DateTimePicker
                                                        value={parseDmyToDate(String(value ?? "")) ?? new Date()}
                                                        mode="date"
                                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                                        maximumDate={new Date()}
                                                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                                            if (Platform.OS !== "ios") {
                                                                setActiveDateField(null);
                                                            }
                                                            if (event.type === "set" && selectedDate) {
                                                                onChange(toDmyDate(selectedDate));
                                                            }
                                                        }}
                                                    />
                                                    {Platform.OS === "ios" ? (
                                                        <Pressable
                                                            onPress={() => setActiveDateField(null)}
                                                            className="mt-2 self-end rounded-lg bg-slate-100 px-3 py-1.5"
                                                        >
                                                            <Text
                                                                className={`text-xs font-semibold text-slate-700 ${getMyanmarLeadingClass(locale)}`}
                                                                style={style}
                                                            >
                                                                {locale === "mm" ? "ပြီးပါပြီ" : "Done"}
                                                            </Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            ) : null}
                                        </View>
                                    )}
                                />
                                {!!errors.joinDate?.message && (
                                    <Text className={`text-xs font-normal  ${getMyanmarLeadingClass(locale)}`}
                                          style={[style, {color: APP_COLORS.error}]}>
                                        {String(errors.joinDate.message)}
                                    </Text>
                                )}
                            </View>

                            {/* dateOfBirth section */}
                            <View className="gap-1.5">
                                <View className="flex-row items-center gap-1">
                                    <Text
                                        className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                        style={[{color: APP_COLORS.textSecondary}, style]}
                                    >
                                        {t.labels.dateOfBirth}
                                    </Text>
                                </View>
                                <Controller
                                    control={control}
                                    name="dateOfBirth"
                                    render={({field: {onChange, value}}) => (
                                        <View>
                                            <Pressable
                                                onPress={() => setActiveDateField("dateOfBirth")}
                                                className={`flex-row items-center h-14 justify-between rounded-xl  px-3 py-3`}
                                                style={{
                                                    backgroundColor: APP_COLORS.inputBackground,
                                                    borderColor: errors.dateOfBirth ? APP_COLORS.error : APP_COLORS.border,
                                                    borderWidth: 1
                                                }}
                                            >
                                                <Text
                                                    className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                                    style={[style, {color: value ? APP_COLORS.textPrimary : APP_COLORS.textMuted}]}
                                                >
                                                    {value || t.placeholders.dateOfBirth}
                                                </Text>
                                                <Ionicons name="calendar-outline" size={18} color="#64748b"/>
                                            </Pressable>

                                            {activeDateField === "dateOfBirth" ? (
                                                <View className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
                                                    <DateTimePicker
                                                        value={parseDmyToDate(String(value ?? "")) ?? new Date()}
                                                        mode="date"
                                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                                        maximumDate={new Date()}
                                                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                                            if (Platform.OS !== "ios") {
                                                                setActiveDateField(null);
                                                            }
                                                            if (event.type === "set" && selectedDate) {
                                                                onChange(toDmyDate(selectedDate));
                                                            }
                                                        }}
                                                    />
                                                    {Platform.OS === "ios" ? (
                                                        <Pressable
                                                            onPress={() => setActiveDateField(null)}
                                                            className="mt-2 self-end rounded-lg bg-slate-100 px-3 py-1.5"
                                                        >
                                                            <Text
                                                                className={`text-xs font-semibold text-slate-700 ${getMyanmarLeadingClass(locale)}`}
                                                                style={style}
                                                            >
                                                                {locale === "mm" ? "ပြီးပါပြီ" : "Done"}
                                                            </Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            ) : null}
                                        </View>
                                    )}
                                />
                                {!!errors.dateOfBirth?.message && (
                                    <Text className={`text-xs font-normal  ${getMyanmarLeadingClass(locale)}`}
                                          style={[style, {color: APP_COLORS.error}]}>
                                        {String(errors.dateOfBirth.message)}
                                    </Text>
                                )}
                            </View>

                            {/* role field section */}
                            <View className="gap-1.5">
                                <View className="flex-row items-center gap-1">
                                    <Text
                                        className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                        style={[{color: APP_COLORS.textSecondary}, style]}
                                    >
                                        {t.labels.role}
                                    </Text>
                                </View>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({field: {value, onChange}}) => {

                                        const selectedOption = roleFilterOptions.find((r) => r.value === value);
                                        const selectedLabel = selectedOption?.label;

                                        return (
                                            <Select
                                                value={{value: value, label: selectedLabel ? selectedLabel : ""}}
                                                onValueChange={(next) => {
                                                    if (next && !Array.isArray(next)) {
                                                        onChange(next.value as CreateUserRole);
                                                    }
                                                }}
                                            >
                                                <Select.Trigger
                                                    className={`rounded-xl h-14 py-0 ${getMyanmarLeadingClass(locale)}   px-2.5`}
                                                    style={{
                                                        backgroundColor: APP_COLORS.inputBackground,
                                                        borderColor: APP_COLORS.border,
                                                        borderWidth: 1
                                                    }}
                                                >
                                                    <Select.Value
                                                        placeholder={t.placeholders.role}
                                                        className={` py-0 text-[11px] font-medium ${getMyanmarLeadingClass(locale)}`}
                                                        style={[{color: APP_COLORS.textPrimary}]}
                                                    />
                                                    <Select.TriggerIndicator/>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Overlay/>
                                                    <Select.Content
                                                        className="rounded-2xl"
                                                        style={{
                                                            backgroundColor: APP_COLORS.card,
                                                            borderColor: APP_COLORS.border,
                                                            borderWidth: 1
                                                        }}
                                                        presentation="popover"
                                                        width="trigger"
                                                    >
                                                        {roleFilterOptions.map((role) => {
                                                                const itemLabel = role.label;
                                                                const isSelected = role.value === value;
                                                                return (
                                                                    <Select.Item
                                                                        key={role.value}
                                                                        value={role.value}
                                                                        label={itemLabel}
                                                                        style={{
                                                                            backgroundColor: isSelected ? APP_COLORS.primarySoft : 'transparent',
                                                                            paddingVertical: 12,
                                                                            paddingHorizontal: 16,
                                                                        }}
                                                                    >
                                                                        <Select.ItemLabel
                                                                            className={`text-xs ${getMyanmarLeadingClass(locale)}`}
                                                                            style={[style, {
                                                                                color: isSelected ? APP_COLORS.primary : APP_COLORS.textPrimary,
                                                                                fontWeight: isSelected ? "600" : "400"
                                                                            }]}
                                                                        />
                                                                        <Select.ItemIndicator/>
                                                                    </Select.Item>
                                                                )
                                                            }
                                                        )}
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select>
                                        )
                                    }
                                    }
                                />
                                {!!errors.role?.message && (
                                    <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                                          style={[{color: APP_COLORS.error}, style]}>
                                        {errors.role.message}
                                    </Text>
                                )}
                            </View>

                            {/* parent owner field section */}
                            {selectedRole === "VIEWER" ? (
                                <View className="gap-1.5">
                                    <View className="flex-row items-center gap-1">
                                        <Text
                                            className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                                            style={[{color: APP_COLORS.textSecondary}, style]}
                                        >
                                            {t.labels.parentOwner}
                                        </Text>
                                    </View>
                                    <Controller
                                        control={control}
                                        name="parentOwnerId"
                                        render={({field: {onChange, value}}) => {
                                            const selectedOwner = ownerOptions.find(
                                                (option) => option.value === String(value ?? ""),
                                            );
                                            return (
                                                <View>
                                                    <Select
                                                        value={
                                                            selectedOwner
                                                                ? {
                                                                    value: selectedOwner.value,
                                                                    label: selectedOwner.label
                                                                }
                                                                : undefined
                                                        }
                                                        onValueChange={(next) => {
                                                            if (next && !Array.isArray(next)) {
                                                                onChange(next.value);
                                                            }
                                                        }}
                                                    >
                                                        <Select.Trigger
                                                            className={`rounded-xl h-14 py-0 ${getMyanmarLeadingClass(locale)}   px-2.5`}
                                                            style={{
                                                                backgroundColor: APP_COLORS.inputBackground,
                                                                borderColor: selectedOwner?.value ? APP_COLORS.border : APP_COLORS.error,
                                                                borderWidth: 1
                                                            }}
                                                        >
                                                            <Select.Value
                                                                placeholder={t.placeholders.parentOwner}
                                                                className={` py-0 text-[11px] font-medium ${getMyanmarLeadingClass(locale)}`}
                                                                style={[{color: APP_COLORS.textPrimary}]}
                                                            />
                                                            <Select.TriggerIndicator/>
                                                        </Select.Trigger>
                                                        <Select.Portal>
                                                            <Select.Overlay/>
                                                            <Select.Content
                                                                className="rounded-2xl"
                                                                style={{
                                                                    backgroundColor: APP_COLORS.card,
                                                                    borderColor: APP_COLORS.border,
                                                                    borderWidth: 1
                                                                }}
                                                                presentation="popover"
                                                                width="trigger"
                                                            >
                                                                {ownerOptions.map((owner) => {
                                                                    const itemLabel = owner.label;
                                                                    const isSelected = owner.value === value;
                                                                        return (
                                                                            <Select.Item
                                                                                key={owner.value}
                                                                                value={owner.value}
                                                                                label={itemLabel}
                                                                                style={{
                                                                                    backgroundColor: isSelected ? APP_COLORS.primarySoft : 'transparent',
                                                                                    paddingVertical: 12,
                                                                                    paddingHorizontal: 16,
                                                                                }}
                                                                            >
                                                                                <Select.ItemLabel
                                                                                    className={`text-xs ${getMyanmarLeadingClass(locale)}`}
                                                                                    style={[style, {
                                                                                        color: isSelected ? APP_COLORS.primary : APP_COLORS.textPrimary,
                                                                                        fontWeight: isSelected ? "600" : "400"
                                                                                    }]}/>
                                                                                <Select.ItemIndicator/>
                                                                            </Select.Item>
                                                                        )
                                                                    }
                                                                )}
                                                            </Select.Content>
                                                        </Select.Portal>
                                                    </Select>
                                                </View>
                                            );
                                        }}
                                    />
                                    {!!errors.parentOwnerId?.message && (
                                        <Text className={`text-xs font-normal ${getMyanmarLeadingClass(locale)} `}
                                              style={[{color: APP_COLORS.error}, style]}>
                                            {String(errors.parentOwnerId.message)}
                                        </Text>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isPending}
                        className={`mb-2 mt-5 items-center justify-center rounded-xl py-3 ${getMyanmarLeadingClass(locale)}`}
                        style={({pressed}) => ({
                            backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary,
                            opacity: isPending ? 0.7 : 1,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1
                        })}
                    >
                        <Text className={`text-base font-semibold text-white ${getMyanmarLeadingClass(locale)}`}
                              style={style}>
                            {isPending ? t.submitting : t.submit}
                        </Text>
                    </Pressable>

                    {/* active/inactive , lock/unlock field */}
                    <View className="mt-4 rounded-2xl bg-white p-4">
                        <Text
                            className={`mb-3 text-sm font-semibold text-slate-900 ${getMyanmarLeadingClass(locale)}`}
                            style={style}
                        >
                            {t.statusTitle}
                        </Text>

                        <View className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center gap-2">
                                <View
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{backgroundColor: isActiveEnabled ? "#22c55e" : "#94a3b8"}}
                                />
                                <Text className="text-sm text-slate-700" style={style}>
                                    {isActiveEnabled ? t.active : t.inactive}
                                </Text>
                            </View>
                            <Switch
                                animation={{
                                    backgroundColor: {
                                        value: isActiveEnabled ? ['#EAF1F8', APP_COLORS.primary] : ['#EAF1F8', '#EAF1F8']
                                    },
                                }}
                                isSelected={isActiveEnabled}
                                onSelectedChange={onToggleActive}
                                isDisabled={isActiveUpdating}
                            />
                        </View>

                        <View className="my-2 h-px bg-slate-200"/>

                        <View className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center gap-2">
                                <Ionicons
                                    name={isUnlockedEnabled ? "lock-open-outline" : "lock-closed-outline"}
                                    size={15}
                                    color={isUnlockedEnabled ? "#10b981" : "#ef4444"}
                                />
                                <Text className="text-sm text-slate-700" style={style}>
                                    {isUnlockedEnabled ? t.unlock : t.lock}
                                </Text>
                            </View>
                            <Switch
                                animation={{
                                    backgroundColor: {
                                        value: isUnlockedEnabled ? ['#EAF1F8', APP_COLORS.primary] : ['#EAF1F8', '#EAF1F8']
                                    },
                                }}
                                isSelected={isUnlockedEnabled}
                                onSelectedChange={onToggleLocked}
                                isDisabled={isLockUpdating}
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
