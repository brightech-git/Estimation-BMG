import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../../Context/ThemeContext'; // Adjust path as needed
import { createBarcodeScannerModalStyles } from './ScannerStyles'; // Adjust path as needed

export default function BarcodeScannerModal({ 
  visible, 
  onClose, 
  scanningField, 
  onScanned 
}) {
  const { theme } = useTheme();
  const styles = createBarcodeScannerModalStyles(theme);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false); // reset scan state whenever modal opens
    }
  }, [visible]);

  useEffect(() => {
    if (permission && permission.status !== 'granted') {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    onScanned?.(scanningField, data);
    onClose?.();
  };

  if (!permission) {
    return null; // still loading permission object
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.centered}>
          <Text style={styles.permissionMessage}>
            Camera permission is required to scan barcodes
          </Text>
          <TouchableOpacity 
            onPress={requestPermission} 
            style={styles.permissionButton}
          >
            <Text style={styles.permissionText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onClose} 
            style={[styles.closeButton, { marginTop: moderateScale(15) }]}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        {!scanned ? (
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'code128', 'upc_a', 'upc_e'],
              }}
            />
            {/* Scanner Overlay */}
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>
                Point camera at barcode to scan
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.COLORS.primary} />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
        
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✖ Close Scanner</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}