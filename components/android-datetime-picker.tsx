import DateTimePicker from "@react-native-community/datetimepicker";
import React, {useState} from "react";

type AndroidDateTimePickerProps = {
    value: Date;
    isDateOnly: boolean;
    maximumDate?: Date;
    minimumDate?: Date;
    onConfirm: (date: Date) => void;
    onDismiss: () => void;
};

export function AndroidDateTimePicker({
                                          value,
                                          isDateOnly,
                                          maximumDate,
                                          minimumDate,
                                          onConfirm,
                                          onDismiss,
                                      }: AndroidDateTimePickerProps) {
    const [draftDate, setDraftDate] = useState(value);
    const [step, setStep] = useState<"date" | "time">("date");

    return (
        <DateTimePicker
            value={draftDate}
            mode={isDateOnly ? "date" : step}
            display="default"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onValueChange={(_event, nextDate) => {
                if (isDateOnly) {
                    onConfirm(nextDate);
                    return;
                }

                if (step === "date") {
                    const merged = new Date(nextDate);
                    merged.setHours(
                        draftDate.getHours(),
                        draftDate.getMinutes(),
                        0,
                        0,
                    );
                    setDraftDate(merged);
                    setStep("time");
                    return;
                }

                onConfirm(nextDate);
            }}
            onDismiss={onDismiss}
        />
    );
}
