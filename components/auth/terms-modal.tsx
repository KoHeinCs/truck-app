import { SimpleMarkdown } from "@/components/auth/simple-markdown";
import { APP_COLORS } from "@/constants/colors";
import { fetchTermsMarkdown } from "@/constants/terms";
import { getMyanmarLeadingClass, myanmarUITextStyle } from "@/constants/myanmar-font";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/stores/client/locale-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function TermsModal({ visible, onClose }: TermsModalProps) {
  const t = useTranslation("login");
  const locale = useLocaleStore((state) => state.locale);
  const insets = useSafeAreaInsets();
  const mmTextStyle = useMemo(() => myanmarUITextStyle(), []);
  const textStyle = locale === "mm" ? mmTextStyle : undefined;
  const mmLeading = getMyanmarLeadingClass(locale);

  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);

    void fetchTermsMarkdown().then((content) => {
      if (cancelled) return;
      setMarkdown(content);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
      >
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="rounded-t-3xl"
          style={{
            backgroundColor: APP_COLORS.card,
            maxHeight: "88%",
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
            <Text
              className={`flex-1 text-base font-bold ${mmLeading}`}
              style={[textStyle, { color: APP_COLORS.textPrimary }]}
            >
              {t.termsTitle}
            </Text>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: APP_COLORS.inputBackground }}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={APP_COLORS.textSecondary} />
            </Pressable>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: APP_COLORS.border,
              marginHorizontal: 20,
            }}
          />

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color={APP_COLORS.primary} />
              </View>
            ) : (
              <SimpleMarkdown
                content={markdown}
                textStyle={textStyle}
                mmLeading={mmLeading}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
