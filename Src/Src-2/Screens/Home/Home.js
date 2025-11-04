import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Keyboard,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../Context/ThemeContext"; // Adjust path as needed
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import BarcodeScannerModal from "../../Components/Scanner/Scanner";
import useEstimationData from "../../Services/TagDetailsService";
import { createHomeScreenStyles } from "./HomeStyles"; // Adjust path as needed
import { scale } from "../../Utills/Scalling";
import { useNavigation } from "@react-navigation/native";

// Constants
const FALLBACK_IMAGE = require("../../Assets/Images/fallback.jpeg");
const SCANNING_FIELDS = Object.freeze({
  ITEM_ID: "itemId",
  ITEM_TAG: "itemTag",
});

const INPUT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  PATTERN: /^.*$/,
};

const DEBOUNCE_DELAY = 300;

export default function Homescreen1() {
  const { theme } = useTheme();
  const styles = createHomeScreenStyles(theme);
  
  const itemIdRef = useRef(null);
  const itemTagRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const navigation = useNavigation();

  const [itemId, setItemId] = useState("");
  const [itemTag, setItemTag] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningField, setScanningField] = useState(null);
  const [isScannedData, setIsScannedData] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState({ id: "", tag: "" });
  const [inputErrors, setInputErrors] = useState({ itemId: "", itemTag: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const { estimationData, loading, error } = useEstimationData(
    fetchTrigger.id,
    fetchTrigger.tag
  );

  const handleFloatingButtonPress = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (scannerVisible) {
          setScannerVisible(false);
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [scannerVisible]);

  const dynamicStyles = useMemo(
    () => ({
      submitButton: {
        backgroundColor: theme.COLORS.success,
        opacity: (itemId.trim() || itemTag.trim()) && !isProcessing ? 1 : 0.6,
      },
      refreshButton: {
        backgroundColor: theme.COLORS.warning,
        opacity:
          (itemId.trim() || itemTag.trim() || hasSubmitted) && !isProcessing
            ? 1
            : 0.6,
      },
      iconButton: {
        backgroundColor: theme.COLORS.primary,
        opacity: !isProcessing ? 1 : 0.6,
      },
    }),
    [itemId, itemTag, isProcessing, hasSubmitted, theme]
  );

  const validateInput = useCallback(
    (value, field) => {
      const errors = { ...inputErrors };
      if (!value.trim()) {
        errors[field] = "";
      } else if (value.length < INPUT_VALIDATION.MIN_LENGTH) {
        errors[field] = "Input too short";
      } else if (value.length > INPUT_VALIDATION.MAX_LENGTH) {
        errors[field] = "Input too long";
      } else if (!INPUT_VALIDATION.PATTERN.test(value)) {
        errors[field] = "Invalid characters";
      } else {
        errors[field] = "";
      }
      setInputErrors(errors);
      return !errors[field];
    },
    [inputErrors]
  );

  const debouncedValidation = useCallback(
    (value, field) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) validateInput(value, field);
      }, DEBOUNCE_DELAY);
    },
    [validateInput]
  );

  const handleManualInput = useCallback(
    (value, field) => {
      setIsScannedData(false);
      const trimmedValue = value.trim();
      if (field === SCANNING_FIELDS.ITEM_ID) setItemId(trimmedValue);
      else if (field === SCANNING_FIELDS.ITEM_TAG) setItemTag(trimmedValue);

      debouncedValidation(
        trimmedValue,
        field === SCANNING_FIELDS.ITEM_ID ? "itemId" : "itemTag"
      );
    },
    [debouncedValidation]
  );

  const parseInputData = useCallback((input) => {
    if (!input?.includes("-")) return { id: input || "", tag: "" };
    const parts = input.split("-");
    return { id: parts[0]?.trim() || "", tag: parts[1]?.trim() || "" };
  }, []);

  const handleSubmit = useCallback(() => {
    if (isProcessing) return;

    Keyboard.dismiss();

    const trimmedId = itemId.trim();
    const trimmedTag = itemTag.trim();

    if (!trimmedId && !trimmedTag) {
      Alert.alert("Input Required", "Please enter Item ID or Item Tag");
      return;
    }
    if (inputErrors.itemId || inputErrors.itemTag) {
      Alert.alert(
        "Validation Error",
        "Please fix input errors before submitting"
      );
      return;
    }

    setIsProcessing(true);
    try {
      let finalId = trimmedId;
      let finalTag = trimmedTag;

      if (trimmedId.includes("-")) {
        const parsed = parseInputData(trimmedId);
        finalId = parsed.id;
        finalTag = parsed.tag;
      } else if (trimmedTag.includes("-")) {
        const parsed = parseInputData(trimmedTag);
        finalId = parsed.id;
        finalTag = parsed.tag;
      }

      setItemId(finalId);
      setItemTag(finalTag);
      setFetchTrigger({ id: finalId, tag: finalTag });
      setHasSubmitted(true);
      setItemId("");
      setItemTag("");
    } catch (err) {
      console.error(err);
      Alert.alert("Submit Error", "Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  }, [itemId, itemTag, parseInputData, inputErrors, isProcessing]);

  const handleRefresh = useCallback(() => {
    setItemId("");
    setItemTag("");
    setFetchTrigger({ id: "", tag: "" });
    setIsScannedData(false);
    setHasSubmitted(false);
    setInputErrors({ itemId: "", itemTag: "" });
    setIsProcessing(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  const handleScanned = useCallback((field, data) => {
    setIsScannedData(true);
    Keyboard.dismiss();

    if (data.includes("-")) {
      const [id, tag] = data.split("-");
      const newId = id?.trim() || "";
      const newTag = tag?.trim() || "";

      setItemId(newId);
      setItemTag(newTag);
      setFetchTrigger({ id: newId, tag: newTag });
      setHasSubmitted(true);
      setItemId("");
      setItemTag("");
    } else {
      const trimmedData = data.trim();
      if (field === SCANNING_FIELDS.ITEM_ID) {
        setItemId(trimmedData);
      }
      if (field === SCANNING_FIELDS.ITEM_TAG) {
        setItemTag(trimmedData);
      }
    }
  }, []);

  const openScanner = useCallback(
    (field) => {
      if (!scannerVisible) setScannerVisible(true);
      setScanningField(field);
    },
    [scannerVisible]
  );

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    setScanningField(null);
  }, []);

  const isSubmitDisabled = useMemo(() => {
    return (
      (!itemId.trim() && !itemTag.trim()) ||
      inputErrors.itemId ||
      inputErrors.itemTag ||
      loading ||
      isProcessing
    );
  }, [itemId, itemTag, inputErrors, loading, isProcessing]);

  const isRefreshDisabled = useMemo(() => {
    return (
      isProcessing ||
      loading ||
      (!itemId.trim() && !itemTag.trim() && !hasSubmitted)
    );
  }, [itemId, itemTag, hasSubmitted, isProcessing, loading]);

  const detailItems = useMemo(() => {
    if (!estimationData) return [];

    try {
      if (estimationData.status === "issued") {
        return [
          {
            label: "Status",
            value: estimationData.status || "",
            testID: "status",
          },
          {
            label: "Bill No",
            value: estimationData.ISSUE_TRANNO || "",
            testID: "issue-tranno",
          },
          {
            label: "Bill Date",
            value: estimationData.ISSUE_TRANSDATE
              ? estimationData.ISSUE_TRANSDATE.split(" ")[0]
              : "",
            testID: "issue-trandate",
          },
        ].filter(Boolean);
      }

      return [
        estimationData.ITEMNAME
          ? {
              label: "Item Name",
              value: estimationData.ITEMNAME,
              testID: "item-name",
              isItem: true,
            }
          : null,

        estimationData.SUBITEMNAME
          ? {
              label: "Sub Item Name",
              value: estimationData.SUBITEMNAME,
              testID: "sub-item-name",
              isSubItem: true,
            }
          : null,

        estimationData.PCS
          ? { label: "Pieces", value: estimationData.PCS, testID: "pieces" }
          : null,

        estimationData.NETWT && Number(estimationData.NETWT) > 0
          ? {
              label: "Net Weight",
              value: `${estimationData.NETWT} grams`,
              testID: "net-weight",
            }
          : null,

        estimationData.GrossAmount
          ? {
              label: "Gross Amount",
              value: `₹ ${estimationData.GrossAmount.toLocaleString("en-IN")}`,
              isGross: true,
              testID: "gross-amount",
            }
          : null,

        estimationData.GSTAmount
          ? {
              label: "GST Amount",
              value: `₹ ${estimationData.GSTAmount.toLocaleString("en-IN")}`,
              isGST: true,
              testID: "gst-amount",
            }
          : null,

        estimationData.GrandTotal
          ? {
              label: "Grand Total",
              value: `₹ ${Math.round(
                Number(estimationData.GrandTotal)
              ).toLocaleString("en-IN")}`,
              isGrandTotal: true,
              testID: "grand-total",
            }
          : null,
      ].filter(Boolean);
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [estimationData]);

  const renderInputField = useCallback(
    (label, value, field) => (
      <View style={styles.column}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            ref={field === SCANNING_FIELDS.ITEM_ID ? itemIdRef : itemTagRef}
            style={[
              styles.input,
              inputErrors[
                field === SCANNING_FIELDS.ITEM_ID ? "itemId" : "itemTag"
              ] && styles.inputError,
            ]}
            placeholder={"Enter Tagkey"}
            placeholderTextColor={theme.COLORS.placeholder}
            value={value}
            onChangeText={(text) => handleManualInput(text, field)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            maxLength={INPUT_VALIDATION.MAX_LENGTH}
            accessibilityLabel={`${label} input field`}
            testID={`input-${field}`}
            keyboardType="default"
          />
          <TouchableOpacity
            style={[
              styles.iconButton, 
              dynamicStyles.iconButton,
              isProcessing && styles.disabledIconButton
            ]}
            onPress={() => openScanner(field)}
            disabled={isProcessing}
            testID={`scan-button-${field}`}
          >
            <Ionicons
              name="camera-outline"
              size={theme.SIZES.h6}
              color={theme.COLORS.buttonText}
            />
          </TouchableOpacity>
        </View>
        {inputErrors[
          field === SCANNING_FIELDS.ITEM_ID ? "itemId" : "itemTag"
        ] ? (
          <Text style={styles.errorMessage}>
            {
              inputErrors[
                field === SCANNING_FIELDS.ITEM_ID ? "itemId" : "itemTag"
              ]
            }
          </Text>
        ) : null}
      </View>
    ),
    [inputErrors, handleManualInput, handleSubmit, openScanner, dynamicStyles, isProcessing, theme]
  );

  const renderActionButtons = useCallback(
    () => (
      <View style={styles.buttonsColumn}>
        <Text style={styles.label}></Text>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              dynamicStyles.submitButton,
              isSubmitDisabled && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            testID="submit-button"
          >
            <Text style={styles.buttonText}>
              {loading || isProcessing ? (
                <ActivityIndicator size="small" color={theme.COLORS.buttonText} />
              ) : (
                "Submit"
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.refreshButton,
              dynamicStyles.refreshButton,
              isRefreshDisabled && styles.disabledButton,
            ]}
            onPress={handleRefresh}
            disabled={isRefreshDisabled}
            testID="refresh-button"
          >
            <Text style={styles.buttonText}>
              {isProcessing ? (
                <ActivityIndicator size="small" color={theme.COLORS.buttonText} />
              ) : (
                "Refresh"
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      dynamicStyles,
      handleSubmit,
      handleRefresh,
      isSubmitDisabled,
      isRefreshDisabled,
      loading,
      isProcessing,
      theme
    ]
  );

  const renderDetailItem = useCallback((item, index) => {
    const valueStyle = [
      styles.detailValue,
      item.isGrandTotal && styles.grandTotalValue,
      item.isGST && styles.gstValue,
      item.isSubItem && styles.subItemValue,
      item.isItem && styles.itemValue,
    ];
    return (
      <View
        key={`detail-${index}`}
        style={[styles.detailRow, item.isGrandTotal && styles.grandTotalRow]}
        testID={item.testID}
      >
        <Text style={styles.detailLabel}>{item.label}</Text>
        <Text style={valueStyle}>{item.value}</Text>
      </View>
    );
  }, []);

  const renderContent = useCallback(() => {
    if (loading || isProcessing) {
      return (
        <View style={styles.center} testID="loading-container">
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading estimation...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center} testID="error-container">
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSubmitted) {
      return (
        <Text style={styles.placeholderText} testID="placeholder-text">
          Enter Item ID and Tag to view estimation.
        </Text>
      );
    }

    if (estimationData && estimationData.message === "No record found") {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            ❌ No records found for this Tag Key
          </Text>
        </View>
      );
    }

    if (estimationData) {
      return (
        <View style={styles.card} testID="estimation-card">
          <View style={styles.imageContainer}>
            <Image
              source={
                estimationData.ItemImage
                  ? { uri: estimationData.ItemImage }
                  : FALLBACK_IMAGE
              }
              style={styles.itemImage}
              resizeMode="cover"
              defaultSource={FALLBACK_IMAGE}
              onError={() => console.warn("Failed to load item image")}
              testID="item-image"
            />
          </View>
          <Text style={styles.itemName}>
            {estimationData.ITEMID || "RINGS"}-{estimationData.TAGNO || "RINGS"}
          </Text>
          <View style={styles.detailsContainer}>
            {detailItems.map(renderDetailItem)}
          </View>
        </View>
      );
    }

    return (
      <Text style={styles.placeholderText} testID="placeholder-text">
        Enter Item ID and Tag to view estimation.
      </Text>
    );
  }, [
    loading,
    isProcessing,
    error,
    hasSubmitted,
    estimationData,
    detailItems,
    renderDetailItem,
    handleRefresh,
    theme
  ]);

  return (
    <>
      <Header />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputRow}>
          {renderInputField("Tag Key", itemId, SCANNING_FIELDS.ITEM_ID)}
          {renderActionButtons()}
        </View>
        {renderContent()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleFloatingButtonPress}
        testID="floating-action-button"
      >
        <Ionicons name="home" size={24} color={theme.COLORS.buttonText} />
      </TouchableOpacity>

      <Footer style={styles.footer} />

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={closeScanner}
        scanningField={scanningField}
        onScanned={handleScanned}
      />
    </>
  );
}