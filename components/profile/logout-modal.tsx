import React from "react";
import {Modal, View, Text, Pressable, StyleSheet} from "react-native";
import {APP_COLORS} from "@/constants/colors";
import {useTranslation} from "@/hooks/use-translation";

interface LogoutModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirmLogout: () => void;
    isLoggingOut?: boolean;
    style: any;
    mmLeading: any;
}

export function LogoutModal({
                                isVisible,
                                onClose,
                                onConfirmLogout,
                                isLoggingOut = false,
                                style,
                                mmLeading
                            }: LogoutModalProps) {

    const t = useTranslation('logout')

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.backdropContainer}>

                <View
                    className="w-[85%] max-w-[340px] p-5 rounded-2xl"
                    style={{
                        backgroundColor: APP_COLORS.card,
                        borderColor: APP_COLORS.border,
                        borderWidth: 1,
                        elevation: 10,
                        shadowColor: "#000",
                        shadowOffset: {width: 0, height: 4},
                        shadowOpacity: 0.2,
                        shadowRadius: 10
                    }}
                >
                    {/* header */}
                    <Text
                        className={`text-base font-bold tracking-tight ${mmLeading}`}
                        style={[style, {color: APP_COLORS.textPrimary}]}
                    >
                        {t.header}
                    </Text>

                    {/* body */}
                    <Text
                        className={`text-xs font-medium leading-5 mt-2  ${mmLeading}`}
                        style={[style, {color: APP_COLORS.textSecondary}]}
                    >
                        {t.body}
                    </Text>

                    {/* cancel && confirm buttons */}
                    <View className="flex-row gap-2 mt-5">

                        <Pressable
                            onPress={onClose}
                            disabled={isLoggingOut}
                            className="flex-1 h-11 border rounded-xl items-center justify-center"
                            style={({pressed}) => ({
                                borderColor: APP_COLORS.border,
                                backgroundColor: pressed ? APP_COLORS.inputBackground : 'transparent'
                            })}
                        >
                            <Text
                                className={`text-xs font-bold ${mmLeading}`}
                                style={[{color: APP_COLORS.textSecondary}, style]}
                            >
                                {t.no}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={onConfirmLogout}
                            className="flex-1 h-11 rounded-xl items-center justify-center"
                            style={({pressed}) => ({
                                backgroundColor: pressed ? APP_COLORS.error : APP_COLORS.error,
                                opacity: pressed || isLoggingOut ? 0.85 : 1
                            })}
                        >
                            <Text
                                className={`text-xs font-bold text-white ${mmLeading}`}
                                style={style}
                            >
                                {t.yes}
                            </Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdropContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    }
});
