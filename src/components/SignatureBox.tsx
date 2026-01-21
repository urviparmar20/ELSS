import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  PanResponder,
  GestureResponderEvent,
  Text,
  Alert,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy"; // legacy import
import { ThemedText } from "../components/ThemedText";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";

interface SignatureBoxProps {
  label: string;
  value: string;
  // onChange: (signature: string) => void; // returns SVG path string
  onChange: (imageUri: string) => void; // ✅ return file uri

}

interface Point {
  x: number;
  y: number;
}

export function SignatureBox({ label, value, onChange }: SignatureBoxProps) {
  const colors = Colors.light;
  const [paths, setPaths] = useState<string[]>(() => (value ? [value] : []));
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [imageUri, setImageUri] = useState<string>(""); // store generated PNG file
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const viewRef = useRef<View>(null);

  const pointsToPath = useCallback((points: Point[]): string => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setCurrentPath((prevCurrentPath) => {
          if (prevCurrentPath.length > 0) {
            let pathStr = `M ${prevCurrentPath[0].x} ${prevCurrentPath[0].y}`;
            for (let i = 1; i < prevCurrentPath.length; i++) {
              pathStr += ` L ${prevCurrentPath[i].x} ${prevCurrentPath[i].y}`;
            }
            setPaths((prevPaths) => {
              const newPaths = [...prevPaths, pathStr];
              setTimeout(() => {
                onChangeRef.current(newPaths.join(" "));
              }, 0);
              return newPaths;
            });
          }
          return [];
        });
      },
    })
  ).current;

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    setImageUri("");
    onChangeRef.current("");
  }, []);
  

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  useEffect(() => {
    const generateImage = async () => {
      if (!viewRef.current || paths.length === 0) return;
  
      try {
        const uri = await captureRef(viewRef, {
          format: "png",
          quality: 1,
        });
  
        setImageUri(uri);
  
        // ✅ THIS sends the file URI to parent
        onChangeRef.current(uri);
        } catch (e) {
        console.error("Failed to generate signature image", e);
      }
    };
  
    generateImage();
  }, [paths]);
  

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
        <Pressable
          onPress={handleClear}
          style={[styles.clearButton, { opacity: hasSignature ? 1 : 0.4 }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="trash-2" size={14} color={colors.error} />
          <ThemedText type="small" style={{ color: colors.error, marginLeft: 4 }}>
            Clear
          </ThemedText>
        </Pressable>
      </View>

      <View
        ref={viewRef}
        style={[styles.signatureArea, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
      >
        <View {...panResponder.panHandlers} style={{ flex: 1 }}>
          <Svg width="100%" height="100%" style={styles.svg}>
            {paths.map((path, index) => (
              <Path
                key={index}
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

          {!hasSignature && (
            <View style={styles.placeholder}>
              <Feather name="edit-3" size={24} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                Sign here
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

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
});
