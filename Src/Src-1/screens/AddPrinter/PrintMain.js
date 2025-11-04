import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../../../Context/ThemeContext"; // Adjust path as needed
import { usePrinterService } from "../../Service/IpServices";
import { useToast } from "../../Context/ToastContext";
import { createPrinterSettingsStyles } from "./PrinterStyles"; // Adjust path as needed
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Constants
const DEFAULT_PORT = "9100";
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const MIN_PORT = 1;
const MAX_PORT = 65535;
const PREVIEW_PRINTER_COUNT = 3;

// Helper function to safely convert ID to string
const safeIdToString = (id) => id?.toString() ?? "";

// Helper function to validate IP address with proper range checking
const isValidIP = (ip) => {
  if (!IP_PATTERN.test(ip)) return false;
  return ip.split(".").every((octet) => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
};

const PrinterSettings = () => {
  const { theme } = useTheme();
  const styles = createPrinterSettingsStyles(theme);
  const { showToast } = useToast();
  const printerService = usePrinterService();
  const navigation = useNavigation();
  // State management
  const [printerList, setPrinterList] = useState([]);
  const [currentPrinter, setCurrentPrinterState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [host, setHost] = useState("");
  const [port, setPort] = useState(DEFAULT_PORT);
  const [printerName, setPrinterName] = useState("");
  const [showPrinterList, setShowPrinterList] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load printer data on mount
  useEffect(() => {
    loadPrinterData();
  }, []);

  // Update form when current printer changes
  useEffect(() => {
    if (currentPrinter) {
      setHost(currentPrinter.ip_address || "");
      setPort((currentPrinter.port || DEFAULT_PORT).toString());
      setPrinterName(currentPrinter.name || "");
    } else {
      resetForm();
    }
  }, [currentPrinter]);

  // Load printer data from service
  const loadPrinterData = useCallback(async () => {
    try {
      setIsLoading(true);
      const printers = await printerService.getAllPrinters();

      setPrinterList(printers || []);

      // Find active printer - using the data structure from your API
      const activePrinter = printers?.find(
        (printer) => printer.active === true
      );
      setCurrentPrinterState(activePrinter || null);
    } catch (error) {
      console.error("Error loading printer data:", error);
      showToast("Failed to load printer settings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [printerService, showToast]);

  // Validate form input
  const validateInput = useCallback(() => {
    const trimmedHost = host.trim();
    const trimmedPort = port.trim();

    if (!trimmedHost) {
      showToast("Please enter printer IP address", "warning");
      return false;
    }

    if (!isValidIP(trimmedHost)) {
      showToast(
        "Please enter a valid IP address (e.g., 192.168.1.100)",
        "warning"
      );
      return false;
    }

    const portNum = Number(trimmedPort);
    if (
      !trimmedPort ||
      isNaN(portNum) ||
      portNum < MIN_PORT ||
      portNum > MAX_PORT
    ) {
      showToast(
        `Please enter a valid port number (${MIN_PORT}-${MAX_PORT})`,
        "warning"
      );
      return false;
    }

    return true;
  }, [host, port, showToast]);

  // Save or update printer
  const handleSavePrinter = useCallback(async () => {
    if (!validateInput() || isSaving) return;

    setIsSaving(true);
    const printerDisplayName = printerName.trim() || `Printer ${host.trim()}`;

    const printerData = {
      ipAddress: host.trim(),
      port: Number(port),
      name: printerDisplayName,
      active: editingPrinter?.active || false,
    };

    try {
      if (editingPrinter) {
        printerData.id = editingPrinter.id;
        await printerService.updatePrinter(printerData);
        showToast("Printer updated successfully!", "success");
      } else {
        await printerService.createPrinter(printerData);
        showToast("Printer added successfully!", "success");
      }

      await loadPrinterData();
      setEditingPrinter(null);

      if (!editingPrinter) {
        resetForm();
      }
    } catch (error) {
      showToast(
        error.message || "Failed to save printer configuration",
        "error"
      );
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [
    validateInput,
    isSaving,
    printerName,
    host,
    port,
    editingPrinter,
    printerService,
    loadPrinterData,
    showToast,
  ]);

  // Set printer as active
  const handleSetCurrentPrinter = useCallback(
    async (printer) => {
      try {
        const updatePromises = printerList.map(async (p) => {
          const isTargetPrinter = p.id === printer.id;
          const shouldUpdate = isTargetPrinter || p.active;

          if (!shouldUpdate) return p;

          return await printerService.updatePrinter({
            id: p.id,
            ipAddress: p.ip_address,
            port: p.port,
            name: p.name,
            active: isTargetPrinter,
          });
        });

        await Promise.all(updatePromises);
        await loadPrinterData();

        setShowPrinterList(false);
        showToast(`Current printer set to ${printer.name}`, "success");
      } catch (error) {
        console.error("Error in handleSetCurrentPrinter:", error);
        showToast(error.message || "Failed to set current printer", "error");
      }
    },
    [printerList, printerService, loadPrinterData, showToast]
  );

  // Clear active printer
  const clearCurrentPrinter = useCallback(async () => {
    try {
      const updatePromises = printerList
        .filter((p) => p.active)
        .map(
          async (p) =>
            await printerService.updatePrinter({
              id: p.id,
              ipAddress: p.ip_address,
              port: p.port,
              name: p.name,
              active: false,
            })
        );

      await Promise.all(updatePromises);
      await loadPrinterData();
      showToast("Current printer cleared", "info");
    } catch (error) {
      console.error("Error clearing current printer:", error);
      showToast("Failed to clear current printer", "error");
    }
  }, [printerList, printerService, loadPrinterData, showToast]);

  // Edit printer
  const handleEditPrinter = useCallback((printer) => {
    setEditingPrinter(printer);
    setHost(printer.ip_address || "");
    setPort(printer.port.toString());
    setPrinterName(printer.name || "");
    setShowPrinterList(false);
  }, []);

  // Delete printer
  const handleDeletePrinter = useCallback(
    (printer) => {
      Alert.alert(
        "Delete Printer",
        `Are you sure you want to delete "${printer.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await printerService.deletePrinter(printer.id);
                await loadPrinterData();
                showToast("Printer deleted successfully", "success");
              } catch (error) {
                showToast(error.message || "Failed to delete printer", "error");
                console.error(error);
              }
            },
          },
        ]
      );
    },
    [printerService, loadPrinterData, showToast]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setHost("");
    setPort(DEFAULT_PORT);
    setPrinterName("");
    setEditingPrinter(null);
  }, []);

  // Clear all printers
  const handleClearAllPrinters = useCallback(async () => {
    try {
      await Promise.all(
        printerList.map((printer) => printerService.deletePrinter(printer.id))
      );

      await loadPrinterData();
      setShowClearConfirm(false);
      showToast("All printers have been deleted", "success");
    } catch (error) {
      console.error("Error clearing printers:", error);
      showToast("Failed to clear printer configuration", "error");
    }
  }, [printerList, printerService, loadPrinterData, showToast]);

  // Refresh printers
  const refreshPrinters = useCallback(async () => {
    await loadPrinterData();
    showToast("Printer list updated", "info");
  }, [loadPrinterData, showToast]);

  // Filter printers based on search query
  const filteredPrinters = useMemo(() => {
    if (!searchQuery) return printerList;

    const query = searchQuery.toLowerCase();
    return printerList.filter(
      (printer) =>
        printer.name.toLowerCase().includes(query) ||
        (printer.ip_address || "").includes(query) ||
        printer.port.toString().includes(query)
    );
  }, [printerList, searchQuery]);

  // Sort printers by active status and date
  const sortedPrinters = useMemo(() => {
    return [...filteredPrinters].sort((a, b) => {
      // Active printer first
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;

      // Then by last used or created date
      const aDate = new Date(a.last_used || a.created_at);
      const bDate = new Date(b.last_used || b.created_at);

      return bDate - aDate;
    });
  }, [filteredPrinters]);

  // Render individual printer item
  const renderPrinterItem = useCallback(
    ({ item }) => {
      const isCurrent = item.active === true;

      return (
        <View
          style={[styles.printerItem, isCurrent && styles.currentPrinterItem]}
        >
          <View style={styles.printerInfo}>
            <Text style={styles.printerName}>{item.name}</Text>
            <Text style={styles.printerAddress}>
              {item.ip_address}:{item.port}
            </Text>
            {isCurrent && (
              <View style={styles.printerMeta}>
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>ACTIVE</Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.printerActions}>
            {!isCurrent && (
              <TouchableOpacity
                style={[styles.actionButton, styles.selectButton]}
                onPress={() => handleSetCurrentPrinter(item)}
              >
                <Text style={styles.actionButtonText}>Select</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditPrinter(item)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeletePrinter(item)}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleSetCurrentPrinter, handleEditPrinter, handleDeletePrinter, styles]
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item) => safeIdToString(item.id), []);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loadingText}>Loading printer settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.COLORS.buttonText} />
        </TouchableOpacity>

        <Text style={styles.mainTitle}>Printer Configuration</Text>

        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.disabledButton]}
          onPress={refreshPrinters}
          disabled={isLoading}
        >
          <MaterialIcons name="refresh" size={20} color={theme.COLORS.buttonText} />
        </TouchableOpacity>
      </View>

      {/* Current Printer Display */}
      {currentPrinter && (
        <View style={styles.currentPrinterSection}>
          <View style={styles.currentPrinterHeader}>
            <Text style={styles.currentPrinterLabel}>Active Printer</Text>
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.currentPrinterName}>{currentPrinter.name}</Text>
          <Text style={styles.currentPrinterAddress}>
            {currentPrinter.ip_address}:{currentPrinter.port}
          </Text>
          <TouchableOpacity
            style={styles.clearCurrentButton}
            onPress={clearCurrentPrinter}
          >
            <Text style={styles.clearCurrentButtonText}>
              Clear Active Printer
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Printer Form */}
      <View style={styles.formSection}>
        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>
            {editingPrinter ? "Edit Printer" : "Add New Printer"}
          </Text>
          {editingPrinter && (
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelEditText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Printer Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={printerName}
          onChangeText={setPrinterName}
          placeholder="e.g. Kitchen Printer, Counter Printer"
          placeholderTextColor={theme.COLORS.placeholder}
          editable={!isSaving}
        />

        <Text style={styles.label}>Printer IP Address *</Text>
        <TextInput
          style={styles.input}
          value={host}
          onChangeText={setHost}
          placeholder="e.g. 192.168.0.8"
          placeholderTextColor={theme.COLORS.placeholder}
          keyboardType="numeric"
          editable={!isSaving}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Port *</Text>
        <TextInput
          style={styles.input}
          value={port}
          onChangeText={setPort}
          placeholder={DEFAULT_PORT}
          keyboardType="numeric"
          placeholderTextColor={theme.COLORS.placeholder}
          editable={!isSaving}
        />

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSavePrinter}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.COLORS.buttonText} />
          ) : (
            <Text style={styles.buttonText}>
              {editingPrinter ? "Update" : "Add Printer"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Saved Printers List */}
      <View style={styles.savedPrintersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Saved Printers ({printerList.length})
          </Text>
          <View style={styles.sectionActions}>
            {printerList.length > PREVIEW_PRINTER_COUNT && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setShowPrinterList(true)}
              >
                <Text style={styles.manageButtonText}>View All</Text>
              </TouchableOpacity>
            )}
            {printerList.length > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => setShowClearConfirm(true)}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {printerList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🖨️</Text>
            <Text style={styles.emptyText}>No saved printers</Text>
            <Text style={styles.emptySubtext}>
              Add your first printer to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedPrinters.slice(0, PREVIEW_PRINTER_COUNT)}
            renderItem={renderPrinterItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Full Printer List Modal */}
      <Modal
        visible={showPrinterList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrinterList(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPrinterList(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  All Printers ({printerList.length})
                </Text>

                {printerList.length > 0 && (
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search printers..."
                    placeholderTextColor={theme.COLORS.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {filteredPrinters.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      {searchQuery ? "No printers found" : "No saved printers"}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={sortedPrinters}
                    renderItem={renderPrinterItem}
                    keyExtractor={keyExtractor}
                    style={styles.fullList}
                    showsVerticalScrollIndicator={false}
                  />
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setShowPrinterList(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={showClearConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete All Printers?</Text>
            <Text style={styles.confirmMessage}>
              This will permanently delete all {printerList.length} printer
              {printerList.length !== 1 ? "s" : ""} from the database. This
              action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelConfirmButton]}
                onPress={() => setShowClearConfirm(false)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={handleClearAllPrinters}
              >
                <Text style={styles.confirmButtonText}>Delete All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PrinterSettings;
