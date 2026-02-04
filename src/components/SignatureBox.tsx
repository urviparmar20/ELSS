import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  PanResponder,
  Image,
  Text,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import { ThemedText } from "../components/ThemedText";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface SignatureBoxProps {
  label: string;
  value: string;
  onChange: (imageUri: string) => void;
  readOnly?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export function SignatureBox({ label, value, onChange, readOnly = false,
}: SignatureBoxProps) {
  const colors = Colors.light;

  const viewRef = useRef<View>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [imageUri, setImageUri] = useState<string>("");

  const isImage = value?.startsWith("http") || value?.startsWith("file:");

  /* ---------------- Sync existing signature (edit mode) ---------------- */
  useEffect(() => {
    if (isImage) {
      setImageUri(value);
      setPaths([]);
      setCurrentPath([]);
    }
  }, [value]);

  /* ---------------- Helpers ---------------- */
  const pointsToPath = useCallback((points: Point[]): string => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }, []);

  const drawingDisabled = readOnly || !!imageUri;

  /* ---------------- Pan Responder ---------------- */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !drawingDisabled,
      onMoveShouldSetPanResponder: () => !drawingDisabled,

      onPanResponderGrant: (event) => {
        if (drawingDisabled) return;
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },

      onPanResponderMove: (event) => {
        if (drawingDisabled) return;
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
      },

      onPanResponderRelease: () => {
        if (drawingDisabled) return;

        setCurrentPath((prev) => {
          if (prev.length === 0) return [];

          const pathStr = pointsToPath(prev);
          setPaths((p) => [...p, pathStr]);

          return [];
        });
      },
    })
  ).current;

  /* ---------------- Generate PNG after drawing ---------------- */
  useEffect(() => {
    const generateImage = async () => {
      if (!viewRef.current || paths.length === 0) return;

      try {
        const uri = await captureRef(viewRef, {
          format: "png",
          quality: 1,
        });

        setImageUri(uri);
        onChangeRef.current(uri);
      } catch (e) {
        console.error("Signature capture failed", e);
      }
    };

    generateImage();
  }, [paths]);

  /* ---------------- Clear ---------------- */
  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    setImageUri("");
    onChangeRef.current("");
  }, []);

  const hasSignature = !!imageUri || paths.length > 0;

  /* ---------------- Render ---------------- */
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>

        <Pressable
          onPress={handleClear}
          style={[styles.clearButton, { opacity: readOnly || !hasSignature ? 0.4 : 1, }]}
          disabled={readOnly || !hasSignature}
        >
          <Feather name="trash-2" size={14} color={colors.error} />
          <ThemedText type="small" style={{ color: colors.error, marginLeft: 4 }}>
            Clear
          </ThemedText>
        </Pressable>
      </View>

      <View
        ref={viewRef}
        style={[
          styles.signatureArea,
          {
            borderColor: colors.inputBorder,
            backgroundColor: colors.inputBackground,
          },
        ]}
      >
        {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
        ) : (
          <View {...panResponder.panHandlers} style={{ flex: 1 }}>
            <Svg width="100%" height="100%" style={styles.svg}>
              {paths.map((path, i) => (
                <Path
                  key={i}
                  d={path}
                  stroke={colors.text}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {currentPath.length > 0 && (
                <Path
                  d={pointsToPath(currentPath)}
                  stroke={colors.text}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>

            {!hasSignature && !readOnly && (
              <View style={styles.placeholder}>
                <Feather
                  name="edit-3"
                  size={24}
                  color={colors.textSecondary}
                />
                <ThemedText
                  type="small"
                  style={{ color: colors.textSecondary, marginTop: Spacing.xs }}
                >
                  Sign here
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  signatureArea: {
    height: 150,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: {
    fontSize: 12,
    color: "#666",
  },
});
