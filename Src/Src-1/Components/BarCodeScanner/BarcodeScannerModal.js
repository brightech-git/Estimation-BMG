// 📁 src/Components/BarcodeScannerModal.js
import React, { useEffect, useState } from "react";
import { Modal, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTheme } from "../../../Context/ThemeContext"; // ✅ use global theme

export default function BarcodeScannerModal({ visible, onClose, scanningField, onScanned }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { theme, isDarkMode } = useTheme(); // ✅ get theme context
  const COLORS = theme.COLORS;

  useEffect(() => {
    if (permission?.status !== "granted") {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(scanningField, data);
    onClose();
    setTimeout(() => setScanned(false), 2000); // Reset after scan
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} transparent>
        <View
          style={[
            styles.centered,
            { backgroundColor: isDarkMode ? COLORS.background : COLORS.white },
          ]}
        >
          <Text
            style={[
              styles.permissionText,
              { color: isDarkMode ? COLORS.textLight : COLORS.textDark },
            ]}
          >
            Requesting camera permission...
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: COLORS.primary }]}
          >
            <Text style={[styles.closeText, { color: COLORS.white }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "code128", "upc_a", "upc_e"],
          }}
        />
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.closeButton,
            { backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.6)" },
          ]}
        >
          <Text
            style={[
              styles.closeText,
              { color: isDarkMode ? COLORS.white : COLORS.white },
            ]}
          >
            ✖ Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
