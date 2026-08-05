import { APP_COLORS } from "@/constants/colors";
import {
    getMyanmarLeadingClass,
    myanmarUITextStyle,
} from "@/constants/myanmar-font";
import { Select } from "heroui-native";
import { useMemo, useState } from "react";
import { Platform, Text, useWindowDimensions, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

type SelectOption = {
    value: string;
    label: string;
};

type CompactSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    locale: "en" | "mm";
    placeholder: string;
    options: readonly SelectOption[];
    /** Called when the dropdown opens/closes — use to pause parent list scrolling on Android. */
    onOpenChange?: (open: boolean) => void;
};

const ITEM_HEIGHT = 48;

export function CompactSelect({
                                  label,
                                  value,
                                  onChange,
                                  locale,
                                  placeholder,
                                  options,
                                  onOpenChange,
                              }: CompactSelectProps) {
    const { height: screenHeight } = useWindowDimensions();
    const contentMaxHeight = Math.min(280, screenHeight * 0.4);
    const [isOpen, setIsOpen] = useState(false);

    const listHeight = useMemo(
        () => Math.min(contentMaxHeight, Math.max(options.length, 1) * ITEM_HEIGHT),
        [contentMaxHeight, options.length],
    );

    const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
    const style = locale === "mm" ? mmTextStyle : undefined;

    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === value);
    }, [options, value]);

    const selectedLabel = useMemo(() => {
        if (!selectedOption) return "";
        return selectedOption.label;
    }, [selectedOption]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    return (
        <View className="flex-1 gap-1">
            <Text
                className={`text-sm font-medium ${getMyanmarLeadingClass(locale)}`}
                style={[style, { color: APP_COLORS.textMuted }]}
            >
                {label}
            </Text>

            <Select
                value={
                    selectedOption
                        ? { value: selectedOption.value, label: selectedLabel }
                        : undefined
                }
                onValueChange={(next) => {
                    if (next && !Array.isArray(next)) {
                        onChange(next.value);
                    }
                }}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                presentation="popover"
            >
                <Select.Trigger
                    className="rounded-xl border h-11 py-0 px-2.5"
                    style={{
                        backgroundColor: APP_COLORS.inputBackground,
                        borderColor: APP_COLORS.border,
                        borderWidth: 1,
                    }}
                >
                    <Select.Value
                        className={`text-[12px] font-medium py-0 ${getMyanmarLeadingClass(locale)}`}
                        placeholder={placeholder}
                        style={[{ color: APP_COLORS.textPrimary }, style]}
                    />
                    <Select.TriggerIndicator />
                </Select.Trigger>

                <Select.Portal>
                    <Select.Overlay />
                    <Select.Content
                        className="rounded-2xl border"
                        style={{
                            backgroundColor: APP_COLORS.card,
                            borderColor: APP_COLORS.border,
                            borderWidth: 1,
                            height: listHeight,
                            maxHeight: contentMaxHeight,
                            overflow: "hidden",
                        }}
                        presentation="popover"
                        placement="bottom"
                        align="start"
                        width="trigger"
                    >
                        <View
                            style={{ height: listHeight }}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                        >
                            <FlatList
                                data={options as SelectOption[]}
                                keyExtractor={(option) => option.value}
                                nestedScrollEnabled
                                bounces={false}
                                showsVerticalScrollIndicator
                                keyboardShouldPersistTaps="handled"
                                style={{ height: listHeight }}
                                // Android: avoid clipping that breaks nested scroll hit-testing
                                removeClippedSubviews={Platform.OS === "android" ? false : undefined}
                                getItemLayout={(_, index) => ({
                                    length: ITEM_HEIGHT,
                                    offset: ITEM_HEIGHT * index,
                                    index,
                                })}
                                renderItem={({ item: option }) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <Select.Item
                                            value={option.value}
                                            label={option.label}
                                            style={{
                                                backgroundColor: isSelected
                                                    ? APP_COLORS.primarySoft
                                                    : "transparent",
                                                height: ITEM_HEIGHT,
                                                paddingVertical: 0,
                                                paddingHorizontal: 16,
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Select.ItemLabel
                                                className={`text-xs ${getMyanmarLeadingClass(locale)}`}
                                                style={[
                                                    style,
                                                    {
                                                        color: isSelected
                                                            ? APP_COLORS.primary
                                                            : APP_COLORS.textPrimary,
                                                        fontWeight: isSelected ? "600" : "400",
                                                    },
                                                ]}
                                            />
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    );
                                }}
                            />
                        </View>
                    </Select.Content>
                </Select.Portal>
            </Select>
        </View>
    );
}
