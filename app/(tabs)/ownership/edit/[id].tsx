import { ServiceDatePicker } from "@/components/service-date-picker";
import { APP_COLORS } from "@/constants/colors";
import {
  getMyanmarLeadingClass,
  myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { getApiErrorAlertCopy } from "@/lib/api-error-alert";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useOwnershipDetail } from "@/stores/server/ownership/query";
import { useUpdateOwnership } from "@/stores/server/ownership/update-mutation";
import { formatDate, toIsoDate, todayIsoLocal } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Input } from "heroui-native";
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { z } from "zod";

const DATE_MSG = {
  en: "Use dd/mm/yyyy",
  mm: "နေ့/လ/နှစ် ပုံစံ dd/mm/yyyy ထည့်ပါ",
} as const;

function isoToFormDate(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes("/")) return trimmed;
  return formatDate(trimmed);
}

function buildSchema(locale: "en" | "mm") {
  return z.object({
    equipmentName: z
      .string()
      .min(
        1,
        locale === "mm" ? "ကားအမည် လိုအပ်သည်" : "Equipment name is required",
      )
      .max(
        200,
        locale === "mm"
          ? "ကားအမည်သည် စာလုံး 200 ထက်မကျော်ရပါ"
          : "Equipment name cannot exceed 200 characters",
      ),
    buyDate: z
      .string()
      .min(1, locale === "mm" ? "ဝယ်ယူရက် လိုအပ်သည်" : "Buy date is required")
      .refine((value) => !!toIsoDate(value), {
        message: DATE_MSG[locale],
      })
      .refine((value) => {
        const iso = toIsoDate(value);
        if (!iso) return false;
        return iso <= todayIsoLocal();
      }, {
        message:
          locale === "mm"
            ? "ဝယ်ယူရက်သည် အနာဂတ်မဖြစ်ရပါ"
            : "Buy date cannot be in the future",
      }),
    licenseCity: z
      .string()
      .min(
        1,
        locale === "mm" ? "လိုင်စင်မြို့ လိုအပ်သည်" : "License city is required",
      )
      .max(
        100,
        locale === "mm"
          ? "လိုင်စင်မြို့သည် စာလုံး 100 ထက်မကျော်ရပါ"
          : "License city cannot exceed 100 characters",
      ),
    licenseEndDate: z
      .string()
      .min(
        1,
        locale === "mm"
          ? "လိုင်စင်ကုန်ဆုံးရက် လိုအပ်သည်"
          : "License end date is required",
      )
      .refine((value) => !!toIsoDate(value), {
        message: DATE_MSG[locale],
      }),
    estimatedSellAmt: z
      .string()
      .max(
        200,
        locale === "mm"
          ? "ခန့်မှန်းရောင်းဈေးသည် စာလုံး 200 ထက်မကျော်ရပါ"
          : "Estimated sell amount cannot exceed 200 characters",
      )
      .optional()
      .or(z.literal("").or(z.null())),
    purchasePlace: z
      .string()
      .min(
        1,
        locale === "mm"
          ? "ဝယ်ယူသည့်နေရာ လိုအပ်သည်"
          : "Purchase place is required",
      )
      .max(
        200,
        locale === "mm"
          ? "ဝယ်ယူသည့်နေရာသည် စာလုံး 200 ထက်မကျော်ရပါ"
          : "Purchase place cannot exceed 200 characters",
      ),
    notes: z
      .string()
      .max(
        500,
        locale === "mm"
          ? "မှတ်ချက်သည် စာလုံး 500 ထက်မကျော်ရပါ"
          : "Notes cannot exceed 500 characters",
      )
      .optional()
      .or(z.literal("").or(z.null())),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

type TextFieldKey = keyof Omit<FormValues, "buyDate" | "licenseEndDate">;
type DateFieldKey = "buyDate" | "licenseEndDate";

export default function OwnershipEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((state) => state.locale);
  const role = useAuthStore((state) => state.role);

  const upperRole = (role || "").toUpperCase();
  const canSubmit = upperRole === "ADMIN" || upperRole === "OWNER";

  const { updateOwnership: t } = useTranslation("ownership");
  const errorCatalog = useTranslation("error");
  const { mutate, isPending } = useUpdateOwnership();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const ownershipId = Array.isArray(rawId)
    ? String(rawId[0] ?? "").trim()
    : String(rawId ?? "").trim();

  const { data, isPending: isLoading, isError, refetch } =
    useOwnershipDetail(ownershipId);
  const detail = data?.data;
  const version = detail?.version;

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const schema = useMemo(() => buildSchema(locale), [locale]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipmentName: "",
      buyDate: "",
      licenseCity: "",
      licenseEndDate: "",
      estimatedSellAmt: "",
      purchasePlace: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!detail) return;

    reset({
      equipmentName: String(detail.equipmentName ?? "").trim(),
      buyDate: isoToFormDate(detail.buyDate),
      licenseCity: String(detail.licenseCity ?? "").trim(),
      licenseEndDate: isoToFormDate(detail.licenseEndDate),
      estimatedSellAmt: String(detail.estimatedSellAmt ?? "").trim(),
      purchasePlace: String(detail.purchasePlace ?? "").trim(),
      notes: String(detail.notes ?? "").trim(),
    });
  }, [detail, reset]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSubmit = (values: FormValues) => {
    if (!canSubmit) {
      Alert.alert(t.unauthorizedTitle, t.unauthorizedBody);
      return;
    }

    if (!ownershipId || version === undefined || version === null) {
      Alert.alert(t.errorTitle, t.errorBody);
      return;
    }

    const buyDateIso = toIsoDate(values.buyDate);
    const licenseEndDateIso = toIsoDate(values.licenseEndDate);
    if (!buyDateIso || !licenseEndDateIso) {
      Alert.alert(t.errorTitle, t.errorBody);
      return;
    }

    mutate(
      {
        ownershipId,
        version: Number(version),
        equipmentName: values.equipmentName.trim(),
        buyDate: buyDateIso,
        licenseCity: values.licenseCity.trim(),
        licenseEndDate: licenseEndDateIso,
        estimatedSellAmt: values.estimatedSellAmt?.trim() || undefined,
        purchasePlace: values.purchasePlace.trim(),
        notes: values.notes?.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t.successTitle, t.successBody);
          router.back();
        },
        onError: (err: unknown) => {
          const { title, message } = getApiErrorAlertCopy(err, errorCatalog, {
            title: t.errorTitle,
            message: t.errorBody,
          });
          Alert.alert(title, message);
        },
      },
    );
  };

  const renderTextInput = (
    key: TextFieldKey,
    options?: { required?: boolean; multiline?: boolean },
  ) => (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-sm font-medium ${mmLeading}`}
          style={[{ color: APP_COLORS.textSecondary }, style]}
        >
          {t.labels[key]}
          {options?.required ? (
            <Text style={{ color: APP_COLORS.error }}> *</Text>
          ) : null}
        </Text>
        {options?.required ? null : (
          <Text
            className={`text-[11px] font-medium ${mmLeading}`}
            style={{ color: APP_COLORS.warning }}
          >
            {locale === "mm" ? "(မထည့်လည်းရ)" : "(Optional)"}
          </Text>
        )}
      </View>
      <Controller
        control={control}
        name={key}
        render={({ field: { onChange, value } }) => (
          <Input
            value={String(value ?? "")}
            onChangeText={onChange}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 4 : 1}
            textAlignVertical={options?.multiline ? "top" : "center"}
            placeholder={t.placeholders[key]}
            placeholderTextColor={APP_COLORS.textMuted}
            autoCapitalize="none"
            style={[
              {
                backgroundColor: APP_COLORS.inputBackground,
                borderColor: errors[key] ? APP_COLORS.error : APP_COLORS.border,
                borderWidth: 1,
                color: APP_COLORS.textPrimary,
                minHeight: options?.multiline ? 96 : undefined,
              },
              style,
            ]}
            className={`py-0 text-sm font-medium ${mmLeading} ${options?.multiline ? "pt-3" : "h-12"}`}
          />
        )}
      />
      {!!errors[key]?.message && (
        <Text
          className={`text-xs font-normal ${mmLeading}`}
          style={[{ color: APP_COLORS.error }, style]}
        >
          {String(errors[key]?.message)}
        </Text>
      )}
    </View>
  );

  const renderDateInput = (key: DateFieldKey, maximumDate?: Date) => (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-sm font-medium ${mmLeading}`}
          style={[{ color: APP_COLORS.textSecondary }, style]}
        >
          {t.labels[key]}
          <Text style={{ color: APP_COLORS.error }}> *</Text>
        </Text>
      </View>
      <Controller
        control={control}
        name={key}
        render={({ field: { onChange, value } }) => (
          <ServiceDatePicker
            locale={locale}
            value={String(value ?? "")}
            onChange={onChange}
            placeholder={t.placeholders[key]}
            doneLabel={t.dateDone}
            mode="date"
            maximumDate={maximumDate}
            style={style}
            triggerClassName={`h-12 px-3 ${mmLeading}`}
          />
        )}
      />
      {!!errors[key]?.message && (
        <Text
          className={`text-xs font-normal ${mmLeading}`}
          style={[{ color: APP_COLORS.error }, style]}
        >
          {String(errors[key]?.message)}
        </Text>
      )}
    </View>
  );

  if (!ownershipId) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: APP_COLORS.background }}
      >
        <Text
          className={`text-center text-sm text-slate-500 ${mmLeading}`}
          style={style}
        >
          {t.errorBody}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: APP_COLORS.background , flex : 1 }}
    >
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: pressed ? APP_COLORS.primary : APP_COLORS.background,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className={`flex-1 px-3 text-center text-lg font-bold ${mmLeading}`}
          style={[style, { color: APP_COLORS.textPrimary }]}
        >
          {t.title}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {isError ? (
          <View
            className="mb-4 rounded-2xl border p-4"
            style={{
              backgroundColor: APP_COLORS.errorSoft,
              borderColor: APP_COLORS.error,
            }}
          >
            <Text
              className={`text-sm ${mmLeading}`}
              style={[{ color: APP_COLORS.error }, style]}
            >
              {t.errorBody}
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="mt-3 self-start rounded-xl px-4 py-2"
              style={{ backgroundColor: APP_COLORS.primary }}
            >
              <Text className={`text-sm font-semibold text-white ${mmLeading}`} style={style}>
                {locale === "mm" ? "ပြန်ကြိုးစားမည်" : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View
          className="mt-1 rounded-2xl p-4"
          style={{
            backgroundColor: APP_COLORS.card,
            borderColor: APP_COLORS.border,
            borderWidth: 1,
            opacity: isLoading && !detail ? 0.6 : 1,
          }}
        >
          <View className="gap-3">
            <Text
              className={`text-sm font-bold ${mmLeading}`}
              style={[style, { color: APP_COLORS.textPrimary }]}
            >
              {t.ownershipDetailsTitle}
            </Text>

            {isLoading && !detail ? (
              <View className="items-center py-4">
                <ActivityIndicator color={APP_COLORS.primary} />
              </View>
            ) : null}

            {renderTextInput("equipmentName", { required: true })}

            <View className="flex-row gap-2">
              <View className="flex-1">
                {renderDateInput("buyDate", new Date())}
              </View>
              <View className="flex-1">
                {renderDateInput("licenseEndDate")}
              </View>
            </View>

            {renderTextInput("licenseCity", { required: true })}
            {renderTextInput("purchasePlace", { required: true })}
            {renderTextInput("estimatedSellAmt")}
            {renderTextInput("notes", { multiline: true })}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending || !canSubmit || !detail}
          className={`mb-2 mt-5 items-center justify-center rounded-xl py-3 ${mmLeading}`}
          style={({ pressed }) => ({
            backgroundColor: pressed ? APP_COLORS.primaryPressed : APP_COLORS.primary,
            opacity: isPending || !canSubmit || !detail ? 0.6 : 1,
          })}
        >
          <View className="flex-row items-center gap-2">
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
            <Text
              className={`text-sm font-bold text-white ${mmLeading}`}
              style={style}
            >
              {isPending ? t.submitting : t.submit}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
