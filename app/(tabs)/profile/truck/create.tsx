import { APP_COLORS } from "@/constants/colors";
import { myanmarUITextStyle } from "@/constants/myanmar-font";
import profileLocale from "@/locale/profile/profile.json";
import { useLocaleStore } from "@/stores/client/locale-store";
import { useCreateTruck } from "@/stores/server/truck/create-mutation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Input, Select } from "heroui-native";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const YEAR_RE = /^\d{4}$/;
const FUEL_TYPES = ["diesel", "petrol", "CNG"] as const;

function buildSchema(requiredField: string, modelYearInvalid: string) {
  return z.object({
    plateNo: z.string().min(1, requiredField).max(50),
    model: z.string().min(1, requiredField).max(50),
    modelYear: z
      .string()
      .min(1, requiredField)
      .refine((v) => YEAR_RE.test(v.trim()), modelYearInvalid),
    fuelType: z.enum(FUEL_TYPES, { message: requiredField }),
    frontTire: z.string().min(1, requiredField).max(100),
    backTire: z.string().min(1, requiredField).max(100),
    chassisNo: z.string().max(100).optional(),
    engineNo: z.string().max(100).optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function CreateTruckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((state) => state.locale);
  const labels = profileLocale[locale].createTruckScreen;
  const { mutate, isPending } = useCreateTruck();

  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const style = locale === "mm" ? mmTextStyle : undefined;

  const schema = useMemo(
    () => buildSchema(labels.requiredField, labels.modelYearInvalid),
    [labels.modelYearInvalid, labels.requiredField],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNo: "",
      model: "",
      modelYear: "",
      fuelType: "diesel",
      frontTire: "",
      backTire: "",
      chassisNo: "",
      engineNo: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        plateNo: values.plateNo.trim(),
        model: values.model.trim(),
        modelYear: Number(values.modelYear.trim()),
        fuelType: values.fuelType.trim(),
        frontTire: values.frontTire.trim(),
        backTire: values.backTire.trim(),
        chassisNo: values.chassisNo?.trim() || undefined,
        engineNo: values.engineNo?.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(labels.successTitle, labels.successBody);
          router.back();
        },
        onError: (err: unknown) => {
          const data = isAxiosError(err) ? err.response?.data : undefined;
          const msgFromString =
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : "";
          Alert.alert(labels.errorTitle, msgFromString || labels.errorBody);
        },
      },
    );
  };

  const textFields = [
    { key: "plateNo", required: true },
    { key: "model", required: true },
    { key: "modelYear", required: true, keyboardType: "number-pad" as const },
    { key: "frontTire", required: true },
    { key: "backTire", required: true },
    { key: "chassisNo", required: false },
    { key: "engineNo", required: false },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-[#f3f7fb]">
      <View className="flex-row items-center px-4 pb-3 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-[#eef2f6]"
        >
          <Ionicons name="arrow-back" size={22} color="#475569" />
        </Pressable>
        <Text
          className="flex-1 px-3 text-center text-[24px] font-bold text-slate-900"
          style={style}
        >
          {labels.title}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, flexGrow: 1 }}
      >
        <View className="mt-1 rounded-2xl bg-white p-4">
          <View className="gap-3">
            {textFields.map((field) => (
              <View className="gap-1.5" key={field.key}>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm font-medium text-slate-900" style={style}>
                    {labels.fieldLabels[field.key]}
                  </Text>
                  {field.required ? <Text className="text-red-500">*</Text> : null}
                </View>
                <Controller
                  control={control}
                  name={field.key}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={String(value ?? "")}
                      onChangeText={onChange}
                      keyboardType={field.keyboardType}
                      autoCapitalize="none"
                      className="border border-slate-200 bg-white"
                    />
                  )}
                />
                {!!errors[field.key]?.message && (
                  <Text className="text-xs text-red-500">
                    {String(errors[field.key]?.message)}
                  </Text>
                )}
              </View>
            ))}

            <View className="gap-1.5">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-medium text-slate-900" style={style}>
                  {labels.fieldLabels.fuelType}
                </Text>
                <Text className="text-red-500">*</Text>
              </View>

              <Controller
                control={control}
                name="fuelType"
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={{ value, label: value }}
                    onValueChange={(next) => {
                      if (next && !Array.isArray(next)) {
                        onChange(next.value as FormValues["fuelType"]);
                      }
                    }}
                  >
                    <Select.Trigger className="rounded-xl border border-slate-200 bg-white px-2.5">
                      <Select.Value placeholder={labels.fuelTypePlaceholder} style={style} />
                      <Select.TriggerIndicator />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Overlay />
                      <Select.Content
                        className="rounded-2xl border border-slate-200 bg-white"
                        presentation="popover"
                        width="trigger"
                      >
                        {FUEL_TYPES.map((fuelType) => (
                          <Select.Item key={fuelType} value={fuelType} label={fuelType}>
                            <Select.ItemLabel style={style} />
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Portal>
                  </Select>
                )}
              />
              {!!errors.fuelType?.message && (
                <Text className="text-xs text-red-500">{String(errors.fuelType.message)}</Text>
              )}
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="mb-2 mt-5 items-center justify-center rounded-xl py-3.5"
          style={{
            backgroundColor: APP_COLORS.primary,
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <Text className="text-base font-semibold text-white" style={style}>
            {isPending ? labels.submitting : labels.submit}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
