import { APP_COLORS } from "@/constants/colors";
import React, { useMemo } from "react";
import { Text, type TextStyle, View } from "react-native";

type SimpleMarkdownProps = {
  content: string;
  textStyle?: TextStyle;
  mmLeading?: string;
};

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] };

function parseInline(text: string): { bold: boolean; text: string }[] {
  const parts: { bold: boolean; text: string }[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ bold: false, text: text.slice(lastIndex, match.index) });
    }
    parts.push({ bold: true, text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ bold: false, text: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ bold: false, text }];
}

function parseMarkdown(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "p", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "ul", items: listItems });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text: heading[2].trim(),
      });
      continue;
    }

    const bullet = /^[-*•]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1].trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function InlineText({
  text,
  baseClassName,
  textStyle,
  color,
}: {
  text: string;
  baseClassName: string;
  textStyle?: TextStyle;
  color: string;
}) {
  return (
    <Text className={baseClassName} style={[textStyle, { color }]}>
      {parseInline(text).map((part, index) => (
        <Text
          key={`${index}-${part.text.slice(0, 8)}`}
          style={{
            fontWeight: part.bold ? "700" : undefined,
            color,
          }}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

export function SimpleMarkdown({
  content,
  textStyle,
  mmLeading = "",
}: SimpleMarkdownProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  return (
    <View className="gap-3">
      {blocks.map((block, index) => {
        if (block.type === "ul") {
          return (
            <View key={`ul-${index}`} className="gap-2 pl-1">
              {block.items.map((item, itemIndex) => (
                <View
                  key={`li-${index}-${itemIndex}`}
                  className="flex-row gap-2"
                >
                  <Text
                    className={`text-sm ${mmLeading}`}
                    style={[textStyle, { color: APP_COLORS.primary }]}
                  >
                    •
                  </Text>
                  <View className="flex-1">
                    <InlineText
                      text={item}
                      baseClassName={`text-sm leading-5 ${mmLeading}`}
                      textStyle={textStyle}
                      color={APP_COLORS.textSecondary}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        const sizeClass =
          block.type === "h1"
            ? "text-base font-bold"
            : block.type === "h2"
              ? "text-sm font-bold"
              : block.type === "h3"
                ? "text-sm font-semibold"
                : "text-sm leading-5";

        const color =
          block.type === "p"
            ? APP_COLORS.textSecondary
            : APP_COLORS.textPrimary;

        return (
          <InlineText
            key={`${block.type}-${index}`}
            text={block.text}
            baseClassName={`${sizeClass} ${mmLeading}`}
            textStyle={textStyle}
            color={color}
          />
        );
      })}
    </View>
  );
}
