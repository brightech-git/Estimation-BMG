import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePrinterService } from "../../Service/IpServices";
import { useApiBaseUrl } from "../../../Config/Config";
import { fetchEstimationData, printEstimationToPrinter } from "../../Service/EstimationPrinterService";
import EstimationPreviewModal from "../EstimationPreviewModal/EstimationPreviewModal";

// Preview management for estimation slips
let estimationPreviewCallback = null;

export const showEstimationPreview = (slipData) => {
  if (estimationPreviewCallback) {
    estimationPreviewCallback(slipData);
  }
};

// Main function to print estimation slip with preview
export const printEstimationSlip = async (estBatchNo, username, apiBaseUrl) => {
  try {
    console.log('🖨️ Starting print process for batch:', estBatchNo);
    
    if (!apiBaseUrl) {
      Alert.alert('Error', 'API base URL is not configured.');
      return;
    }
    
    const slipData = await fetchEstimationData(estBatchNo, username, apiBaseUrl);
    if (slipData) {
      console.log('✅ Slip data fetched successfully, showing preview');
      showEstimationPreview(slipData);
    } else {
      Alert.alert('Error', 'No data found for printing');
    }
  } catch (error) {
    console.error('❌ Error preparing estimation slip:', error);
    Alert.alert('Error', 'Failed to prepare estimation slip for printing.');
  }
};

// Main hook for estimation printing
export const useEstimationPreview = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [slipData, setSlipData] = useState(null);
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const API_BASE_URL = useApiBaseUrl();
  const printerService = usePrinterService();
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  // Load active printer from the service
  const loadActivePrinter = useCallback(async () => {
    if (isLoading.current) {
      return; // Prevent concurrent calls
    }

    try {
      isLoading.current = true;
      console.log('🖨️ Loading active printer from service...');
      
      const printers = await printerService.getAllPrinters();
      
      if (!isMounted.current) return;
      
      // Find the active printer from the API response
      const activePrinter = printers?.find(printer => printer.active === true);
      console.log('🎯 Active printer found:', activePrinter ? activePrinter.name : 'None');
      
      setCurrentPrinter(activePrinter || null);
      
    } catch (error) {
      console.error('❌ Error loading active printer:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to load printer configuration');
      }
    } finally {
      if (isMounted.current) {
        isLoading.current = false;
        setLoading(false);
      }
    }
  }, [printerService]);

  // Initial load - run only once
  useEffect(() => {
    isMounted.current = true;
    loadActivePrinter();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency - run only on mount

  // Refresh printer when component comes into focus - with debounce
  useEffect(() => {
    let timeoutId;

    const handleFocus = () => {
      // Debounce to prevent multiple rapid calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('🔄 Refreshing printer config on screen focus');
        loadActivePrinter();
      }, 500);
    };

    const unsubscribe = navigation.addListener('focus', handleFocus);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigation]); // Remove loadActivePrinter from dependencies

  // Preview callback setup
  useEffect(() => {
    estimationPreviewCallback = (data) => {
      try {
        console.log('🎬 Showing preview with data');
        setSlipData(data);
        setPreviewVisible(true);
      } catch (error) {
        console.error('Error showing preview:', error);
        Alert.alert('Error', 'Failed to show preview');
      }
    };

    return () => {
      estimationPreviewCallback = null;
    };
  }, []);

  const hidePreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  const executePrint = useCallback(async () => {
    try {
      console.log('🖨️ Execute print called, current printer:', currentPrinter?.name);
      
      if (!currentPrinter) {
        Alert.alert(
          "No Printer Selected", 
          "Please set a current printer in Printer Settings before printing.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => {
                navigation.navigate('Print');
                hidePreview();
              }
            }
          ]
        );
        return;
      }

      setPreviewVisible(false);
      
      if (slipData) {
        console.log('📄 Printing slip data with printer:', currentPrinter.name);
        await printEstimationToPrinter(slipData, currentPrinter);
      }
    } catch (error) {
      console.error('❌ Print error:', error);
      if (error.message !== "No current printer selected") {
        Alert.alert('Print Error', error.message || 'Failed to print slip');
      }
    }
  }, [currentPrinter, slipData, navigation, hidePreview]);

  const EstimationPreviewComponent = React.useMemo(() => (
    <EstimationPreviewModal
      visible={previewVisible}
      onClose={hidePreview}
      onPrint={executePrint}
      slipData={slipData}
      currentPrinter={currentPrinter}
    />
  ), [previewVisible, hidePreview, executePrint, slipData, currentPrinter]);

  const handlePrintEstimationSlip = useCallback((estBatchNo, username) => {
    console.log('📞 printEstimationSlip called from hook');
    return printEstimationSlip(estBatchNo, username, API_BASE_URL);
  }, [API_BASE_URL]);

  return { 
    EstimationPreviewComponent, 
    currentPrinter, 
    loading,
    hasCurrentPrinter: !!currentPrinter,
    printEstimationSlip: handlePrintEstimationSlip,
    refreshPrinter: loadActivePrinter
  };
};

export default useEstimationPreview;