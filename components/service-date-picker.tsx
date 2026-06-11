import {APP_COLORS} from "@/constants/colors";
import {getMyanmarLeadingClass} from "@/constants/myanmar-font";
import type {AppLocale} from "@/stores/client/locale-store";
import {formatDmyDate, parseDmyToDate} from "@/utils/dateUtil";
import {
    formatServiceDateDisplay,
    parseServiceDateDisplayToDate,
} from "@/utils/service-date";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, {useCallback, useState} from "react";
import {Modal, Platform, Pressable, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type ServiceDatePickerProps = {
    locale: AppLocale;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    doneLabel: string;
    cancelLabel?: string;
    maximumDate?: Date;
    minimumDate?: Date;
    mode?: "date" | "datetime";
    triggerClassName?: string;
    style: any;
};

export function ServiceDatePicker({
                                      locale,
                                      value,
                                      onChange,
                                      placeholder,
                                      doneLabel,
                                      cancelLabel,
                                      maximumDate,
                                      minimumDate,
                                      mode = "datetime",
                                      triggerClassName,
                                      style
                                  }: ServiceDatePickerProps) {

    const insets = useSafeAreaInsets();
    const [open, setOpen] = useState(false);
    const [draftDate, setDraftDate] = useState(() => new Date());
    const mmLeading = getMyanmarLeadingClass(locale);
    const isDateOnly = mode === "date";
    const resolvedCancelLabel = cancelLabel ?? (locale === "mm" ? "မလုပ်တော့" : "Cancel");

    const parseValue = useCallback(
        (raw: string): Date | null =>
            isDateOnly ? parseDmyToDate(raw) : parseServiceDateDisplayToDate(raw),
        [isDateOnly],
    );

    const formatValue = useCallback(
        (date: Date): string =>
            isDateOnly ? formatDmyDate(date) : formatServiceDateDisplay(date),
        [isDateOnly],
    );

    const openPicker = () => {
        setDraftDate(parseValue(value) ?? new Date());
        setOpen(true);
    };

    const closePicker = () => {
        setOpen(false);
    };

    const confirmPicker = () => {
        onChange(formatValue(draftDate));
        closePicker();
    };

    const handleAndroidChange = (
        event: DateTimePickerEvent,
        nextDate?: Date,
    ) => {
        closePicker();
        if (event.type === "set" && nextDate) {
            onChange(formatValue(nextDate));
        }
    };

    return (
        <View>
            <Pressable
                onPress={openPicker}
                className={`min-h-13 flex-row items-center justify-between rounded-xl px-3 py-2 ${triggerClassName ?? ""}`}
                style={{
                    backgroundColor:APP_COLORS.inputBackground,
                    borderColor:APP_COLORS.border,
                    borderWidth:1
                }}
            >
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`text-sm font-medium flex-1 pr-1 ${value ? "text-slate-900" : "text-slate-400"} ${mmLeading}`}
                    style={[{
                        color:APP_COLORS.textPrimary
                    },style]}
                >
                    {value || placeholder}
                </Text>
                <Ionicons name="calendar-outline" size={22} color="#94a3b8"/>
            </Pressable>

            {open && Platform.OS === "android" ? (
                <DateTimePicker
                    value={draftDate}
                    mode={isDateOnly ? "date" : "datetime"}
                    display="default"
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    onChange={handleAndroidChange}
                />
            ) : null}

            {Platform.OS === "ios" ? (
                <Modal
                    visible={open}
                    transparent
                    animationType="slide"
                    onRequestClose={closePicker}
                >
                    <View className="flex-1 justify-end">
                        <Pressable
                            className="absolute inset-0 bg-black/40"
                            onPress={closePicker}
                        />
                        <View
                            className="rounded-t-3xl bg-white px-4 pt-3"
                            style={{paddingBottom: insets.bottom + 12}}
                        >
                            {/* cancel && choose button */}
                            <View className="mb-1 flex-row items-center justify-between">
                                <Pressable
                                    onPress={closePicker}
                                    hitSlop={8}
                                    className="px-1 py-2"
                                >
                                    <Text
                                        className={`text-lg font-semibold ${mmLeading}`}
                                        style={[{color: APP_COLORS.primary},style]}
                                    >
                                        {resolvedCancelLabel}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={confirmPicker}
                                    hitSlop={8}
                                    className="px-1 py-2"
                                >
                                    <Text
                                        className={`text-lg font-semibold ${mmLeading}`}
                                        style={[{color: APP_COLORS.primary},style]}
                                    >
                                        {doneLabel}
                                    </Text>
                                </Pressable>
                            </View>

                            {/* date/datetime component */}
                            <DateTimePicker
                                value={draftDate}
                                mode={isDateOnly ? "date" : "datetime"}
                                display="spinner"
                                maximumDate={maximumDate}
                                minimumDate={minimumDate}
                                themeVariant="light"
                                onChange={(_event, nextDate) => {
                                    if (nextDate) {
                                        setDraftDate(nextDate);
                                    }
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            ) : null}
        </View>
    );
}
