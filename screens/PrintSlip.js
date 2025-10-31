import TcpSocket from "react-native-tcp-socket";
import {
  Alert,
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FONTS, PRINTER_COMMANDS, printTextLogo } from "./Themedata";


// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const API_BASE_URL = "https://est.bmgjewellers.com/api/v1";
const PRINTER_CONFIG = {
  port: 9100,
  host: "192.168.0.8",
  reuseAddress: true,
  timeout: 10000,
};
const PRINT_WIDTH = 40; // Characters per line for 58mm printer

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date to DD/MM/YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Get current time in 12-hour format
 */
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Merge duplicate items by itemid and tagno
 */
const mergeItems = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = `${item.itemid}-${item.tagno}`;
    if (!map.has(key)) {
      map.set(key, { 
        ...item, 
        taxes: Array.isArray(item.taxes) ? [...item.taxes] : [] 
      });
    } else {
      const existing = map.get(key);
      existing.pcs = (existing.pcs || 0) + (item.pcs || 0);
      existing.netwt = (existing.netwt || 0) + (item.netwt || 0);
      existing.grswt = (existing.grswt || 0) + (item.grswt || 0);
      existing.amount = (existing.amount || 0) + (item.amount || 0);
      
      // Merge taxes
      (item.taxes || []).forEach((tax) => {
        const idx = existing.taxes.findIndex((t) => t.tax_id === tax.tax_id);
        if (idx >= 0) {
          existing.taxes[idx].tax_amount = 
            (existing.taxes[idx].tax_amount || 0) + (tax.tax_amount || 0);
        } else {
          existing.taxes.push({ ...tax });
        }
      });
    }
  });
  return Array.from(map.values());
};

/**
 * Format styled line with proper spacing for printer
 */
const formatStyledLine = (
  leftText,
  rightText,
  style = FONTS.NORMAL,
  totalWidth = PRINT_WIDTH
) => {
  const left = String(leftText || "");
  const right = String(rightText || "");

  let line = style + left;

  if (right) {
    const spacesNeeded = totalWidth - left.length - right.length;
    const spaces = spacesNeeded > 0 ? " ".repeat(spacesNeeded) : " ";
    line += spaces + right;
  }

  return line + FONTS.NORMAL + "\n";
};

/**
 * Safe number formatting
 */
const formatNumber = (value, decimals = 0) => {
  const num = Number(value);
  return isNaN(num) ? "0" : num.toFixed(decimals);
};

// ============================================================================
// PREVIEW MODAL COMPONENT
// ============================================================================

const EstimationPreviewModal = ({ visible, onClose, onPrint, slipData, isPrinting }) => {
  if (!slipData) return null;

  const {
    items,
    sample,
    goldRate,
    silverRate,
    totalpcs,
    totalGrossWeight,
    baseAmount,
    cgstAmount,
    sgstAmount,
    grandTotal,
    offer,
    itemsWithStones,
  } = slipData;

  const offerWeight = offer?.netwt || 0;
  const offerBoardRate = offer?.board_rate || 0;
  const offerDiscount = offerWeight * offerBoardRate;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Estimation Slip Preview</Text>

          <ScrollView
            style={styles.previewContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Customer Details */}
            <View style={styles.section}>
              <Text style={styles.label}>NAME</Text>
              <View style={styles.underline} />
              <Text style={styles.label}>MOBILE</Text>
              <View style={styles.underline} />
            </View>

            <View style={styles.dashedLine} />

            {/* Estimation Info */}
            <View style={styles.row}>
              <Text style={styles.boldText}>ESTIMATION SLIP</Text>
              <Text style={styles.boldText}>
                Est.No: {sample?.tranno || ""} - {sample?.company_id || "SFH"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>
                Date: {formatDate(sample?.trandate)}
              </Text>
              <Text style={styles.text}>Gold: {formatNumber(goldRate, 0)}/Gm</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>Time: {getCurrentTime()}</Text>
              <Text style={styles.text}>
                Silver: {formatNumber(silverRate, 2)}/Gm
              </Text>
            </View>

            <View style={styles.dashedLine} />

            {/* Table Header */}
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.boldText, styles.colDesc]}>Description</Text>
              <Text style={[styles.boldText, styles.colWeight]}>Weight</Text>
              <Text style={[styles.boldText, styles.colVA]}>V.A</Text>
              <Text style={[styles.boldText, styles.colAmount]}>Amount</Text>
            </View>

            <View style={styles.dashedLine} />

            {/* Items List */}
            {itemsWithStones.map((item, idx) => {
              const itemName = (item.itemname || "").toUpperCase();
              const itemNumber = idx + 1;
              const stones = item.stones || [];

              return (
                <View
                  key={`${item.itemid}-${item.tagno}-${idx}`}
                  style={styles.itemContainer}
                >
                  {/* Main Item */}
                  <View style={styles.itemRow}>
                    <Text style={[styles.text, styles.colDesc]}>
                      {itemNumber} {itemName} ({item.pcs} Pcs) [{item.itemid}-
                      {item.tagno}]
                    </Text>
                  </View>

                  <View style={styles.itemRow}>
                    <Text style={[styles.text, styles.colDesc]}>Rate</Text>
                    <Text style={[styles.text, styles.colWeight]}>
                      {formatNumber(item.grswt, 3)}
                    </Text>
                    <Text style={[styles.text, styles.colVA]}>
                      {item.wastper && item.wastper > 0
                        ? formatNumber(item.wastper, 1)
                        : ""}
                    </Text>
                    <Text style={[styles.text, styles.colAmount]}>
                      {formatNumber(item.amount, 0)}
                    </Text>
                  </View>

                  {/* Net Weight */}
                  {item.grswt !== item.netwt && (
                    <View style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>Netwt:</Text>
                      <Text style={[styles.text, styles.colWeight]}>
                        {formatNumber(item.netwt, 3)}
                      </Text>
                    </View>
                  )}

                  {/* Stones */}
                  {stones.map((stone, stoneIdx) => (
                    <View key={`stone-${idx}-${stoneIdx}`} style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>STUDDED</Text>
                      <Text style={[styles.text, styles.colWeight]}>
                        {formatNumber(stone.stnwt, 3)}
                        {stone.stoneunit || ""}
                      </Text>
                      <Text style={[styles.text, styles.colAmount]}>
                        {formatNumber(stone.stnamt, 0)}
                      </Text>
                    </View>
                  ))}

                  {/* MC */}
                  {item.mcgrm && (
                    <View style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>MC:</Text>
                      <Text style={[styles.text, styles.colAmount]}>
                        {formatNumber(item.mcgrm, 0)}
                      </Text>
                    </View>
                  )}

                  {/* Subitem Names */}
                  {item.subitemname && (
                    <View style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>
                        {item.subitemname.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <View style={styles.dashedLine} />

            {/* Totals Section */}
            <View style={styles.totalsSection}>
              <View style={styles.row}>
                <Text style={[styles.text, styles.colDesc]}>
                  Tot.Pcs: {totalpcs}
                </Text>
                <Text style={[styles.text, styles.colWeight]}>
                  {formatNumber(totalGrossWeight, 3)}
                </Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {formatNumber(baseAmount, 0)}
                </Text>
              </View>

              {offerDiscount > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.text, styles.colDesc]}>
                    Offer ({formatNumber(offerWeight, 3)} * {offerBoardRate})
                  </Text>
                  <Text style={[styles.text, styles.colAmount]}>
                    {formatNumber(offerDiscount, 1)}
                  </Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={[styles.text, styles.colDesc]}>CGST (1.5%)</Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {formatNumber(cgstAmount, 0)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.text, styles.colDesc]}>SGST (1.5%)</Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {formatNumber(sgstAmount, 0)}
                </Text>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.row}>
                <Text style={[styles.boldText, styles.colDesc]}>
                  Sales TOTAL:
                </Text>
                <Text style={[styles.boldText, styles.colAmount]}>
                  {formatNumber(grandTotal, 0)}
                </Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.boldText}>[SFH]</Text>
                <Text style={styles.text}>Est.No: {sample?.tranno || ""}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, isPrinting && styles.disabledButton]} 
              onPress={onClose}
              disabled={isPrinting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.printButton, isPrinting && styles.disabledButton]} 
              onPress={onPrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Print Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "95%",
    maxWidth: 600,
    height: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  previewContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d4af37",
    textAlign: "center",
    marginBottom: 4,
  },
  logoSubText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 8,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    borderStyle: "dashed",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tableHeader: {
    backgroundColor: "#e9ecef",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  itemContainer: {
    marginBottom: 8,
    paddingLeft: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  colDesc: {
    flex: 4,
    textAlign: "left",
    fontSize: 10,
  },
  colWeight: {
    flex: 1.5,
    textAlign: "right",
    fontSize: 10,
  },
  colVA: {
    flex: 1,
    textAlign: "right",
    fontSize: 10,
  },
  colAmount: {
    flex: 1.5,
    textAlign: "right",
    fontSize: 10,
  },
  text: {
    fontSize: 10,
    color: "#333",
    fontFamily: "monospace",
  },
  boldText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
  },
  totalsSection: {
    marginTop: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 5,
    flex: 1,
  },
  printButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// ============================================================================
// PREVIEW MANAGEMENT
// ============================================================================

let estimationPreviewCallback = null;

const showEstimationPreview = (slipData) => {
  if (estimationPreviewCallback) {
    estimationPreviewCallback(slipData);
  }
};

/**
 * Hook to manage estimation preview modal
 */
export const useEstimationPreview = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [slipData, setSlipData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  React.useEffect(() => {
    estimationPreviewCallback = (data) => {
      try {
        setSlipData(data);
        setPreviewVisible(true);
        setIsPrinting(false);
      } catch (error) {
        console.error("Error showing preview:", error);
        Alert.alert("Error", "Failed to show preview");
      }
    };

    return () => {
      estimationPreviewCallback = null;
    };
  }, []);

  const hidePreview = useCallback(() => {
    if (!isPrinting) {
      setPreviewVisible(false);
    }
  }, [isPrinting]);

  const executePrint = useCallback(async () => {
    try {
      setIsPrinting(true);
      if (slipData) {
        await printEstimationToPrinter(slipData);
        Alert.alert("Success", "Estimation slip printed successfully");
        setPreviewVisible(false);
      }
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert(
        "Print Error", 
        error.message || "Failed to print slip. Please check printer connection."
      );
    } finally {
      setIsPrinting(false);
    }
  }, [slipData]);

  const EstimationPreviewComponent = useMemo(
    () => (
      <EstimationPreviewModal
        visible={previewVisible}
        onClose={hidePreview}
        onPrint={executePrint}
        slipData={slipData}
        isPrinting={isPrinting}
      />
    ),
    [previewVisible, hidePreview, executePrint, slipData, isPrinting]
  );

  return { EstimationPreviewComponent };
};

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch estimation data from API
 */
const fetchEstimationData = async (estBatchNo, username) => {
  if (!estBatchNo) {
    throw new Error("No Estimation No found for printing.");
  }

  const api = axios.create({ 
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  try {
    // Fetch main estimation data
    const response = await api.get(`/printDetails/${estBatchNo}`);
    const itemsRaw = Array.isArray(response.data) ? response.data : [];
    
    if (!itemsRaw.length) {
      throw new Error("No data found for this Estimation.");
    }

    const items = mergeItems(itemsRaw);
    const sample = items[0];

    // Fetch offer data
    let offer = { discount: 0, netwt: 0, board_rate: 0 };
    try {
      const offerRes = await api.post("/offer", null, {
        params: { tagno: sample.tagno },
      });
      offer = offerRes.data || offer;
    } catch (err) {
      console.warn("Failed to fetch offer:", err.message);
    }

    // Fetch today's rates
    let goldRate = 0;
    let silverRate = 0;
    try {
      const rateRes = await api.get("/todayrate");
      goldRate = rateRes.data?.GOLDRATE || 0;
      silverRate = rateRes.data?.SILVERRATE || 0;
    } catch (err) {
      console.warn("Failed to fetch rates, using fallback:", err.message);
      goldRate = sample.goldrate || 0;
      silverRate = sample.silverrate || 0;
    }

    // Calculate totals
    const totalpcs = items.reduce((sum, i) => sum + (i.pcs || 0), 0);
    const totalGrossWeight = items.reduce((sum, i) => sum + (i.grswt || 0), 0);
    const baseAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);

    // Calculate taxes
    let cgstAmount = 0;
    let sgstAmount = 0;
    items.forEach((item) => {
      (item.taxes || []).forEach((tax) => {
        const taxId = (tax.tax_id || "").toUpperCase();
        if (taxId === "CG") cgstAmount += tax.tax_amount || 0;
        else if (taxId === "SG") sgstAmount += tax.tax_amount || 0;
      });
    });

    const grandTotal = baseAmount + cgstAmount + sgstAmount;

    // Fetch stones for each item in parallel
    const fetchStonesForItem = async (itemid, tagno) => {
      try {
        const res = await api.get("/stnInputs", { 
          params: { itemid, tagno },
          timeout: 5000 
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn(
          `Failed to fetch stones for ITEMID=${itemid} TAGNO=${tagno}:`,
          err.message
        );
        return [];
      }
    };

    const itemsWithStones = await Promise.all(
      items.map(async (item) => {
        const stones = await fetchStonesForItem(item.itemid, item.tagno);
        return { ...item, stones };
      })
    );

    return {
      items,
      sample,
      goldRate,
      silverRate,
      totalpcs,
      totalGrossWeight,
      baseAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
      offer,
      itemsWithStones,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch estimation data."
    );
  }
};

// ============================================================================
// PRINTING FUNCTIONS
// ============================================================================

/**
 * Build print content string
 */
const buildPrintContent = (slipData) => {
  const {
    sample,
    goldRate,
    silverRate,
    totalpcs,
    totalGrossWeight,
    baseAmount,
    cgstAmount,
    sgstAmount,
    grandTotal,
    offer,
    itemsWithStones,
  } = slipData;

  const offerWeight = offer?.netwt || 0;
  const offerBoardRate = offer?.board_rate || 0;
  const offerDiscount = offerWeight * offerBoardRate;

  let content = "";

  // Initialize printer
  content += PRINTER_COMMANDS.INIT;
  content += PRINTER_COMMANDS.LINE_SPACING_DEFAULT;

  // Header
  content += FONTS.ALIGN_CENTER;
  content += FONTS.BOLD_ON + FONTS.DOUBLE_HEIGHT;
  content += "ESTIMATION SLIP\n";
  content += FONTS.BOLD_OFF + FONTS.NORMAL;
  content += PRINTER_COMMANDS.FEED_LINES(1);

  // Customer Details
  content += formatStyledLine(
    "NAME :",
    "_____________________________",
    FONTS.BOLD_ON
  );
  content += formatStyledLine(
    "MOBILE :",
    "_____________________________",
    FONTS.BOLD_ON
  );
  content += "-----------------------------------------\n";

  // Estimation Info
  content += formatStyledLine(
    "ESTIMATION SLIP",
    `Est.No: ${sample?.tranno || ""} - ${sample?.company_id || "SFH"}`,
    FONTS.BOLD_ON
  );
  content += formatStyledLine(
    `Date: ${formatDate(sample?.trandate)}`,
    `Gold: ${formatNumber(goldRate, 0)}/Gm`
  );
  content += formatStyledLine(
    `Time: ${getCurrentTime()}`,
    `Silver: ${formatNumber(silverRate, 2)}/Gm`
  );
  content += "-----------------------------------------\n";

  // Table Header
  content += formatStyledLine(
    "Description",
    "Weight    V.A    Amount",
    FONTS.BOLD_ON
  );
  content += "-----------------------------------------\n";

  // Items List
  itemsWithStones.forEach((item, idx) => {
    const itemName = (item.itemname || "").toUpperCase();
    const itemNumber = idx + 1;
    const stones = item.stones || [];

    // Main item
    content += formatStyledLine(
      `${itemNumber} ${itemName} (${item.pcs} Pcs) [${item.itemid}-${item.tagno}]`,
      "",
      FONTS.BOLD_ON
    );

    content += formatStyledLine(
      "Rate",
      `${formatNumber(item.grswt, 3)}    ${
        item.wastper && item.wastper > 0 ? formatNumber(item.wastper, 1) : ""
      }    ${formatNumber(item.amount, 0)}`
    );

    // Net weight if different
    if (item.grswt !== item.netwt) {
      content += formatStyledLine(
        "Netwt:",
        formatNumber(item.netwt, 3)
      );
    }

    // Stones
    stones.forEach((stone) => {
      content += formatStyledLine(
        "STUDDED",
        `${formatNumber(stone.stnwt, 3)}${stone.stoneunit || ""}        ${formatNumber(stone.stnamt, 0)}`
      );
    });

    // MC
    if (item.mcgrm) {
      content += formatStyledLine("MC:", formatNumber(item.mcgrm, 0));
    }

    // Subitem names
    if (item.subitemname) {
      content += formatStyledLine(item.subitemname.toUpperCase(), "");
    }
  });

  // Totals Section
  content += "-----------------------------------------\n";
  content += formatStyledLine(
    `Tot.Pcs: ${totalpcs}`,
    `${formatNumber(totalGrossWeight, 3)}        ${formatNumber(baseAmount, 0)}`,
    FONTS.BOLD_ON
  );

  if (offerDiscount > 0) {
    content += formatStyledLine(
      `Offer (${formatNumber(offerWeight, 3)} * ${offerBoardRate})`,
      formatNumber(offerDiscount, 1)
    );
  }

  content += formatStyledLine(
    "CGST (1.5%)",
    formatNumber(cgstAmount, 0)
  );
  content += formatStyledLine(
    "SGST (1.5%)",
    formatNumber(sgstAmount, 0)
  );
  content += "-----------------------------------------\n";

  // Grand Total
  content += FONTS.BOLD_ON + FONTS.DOUBLE_HEIGHT;
  content += formatStyledLine(
    "Sales TOTAL:",
    formatNumber(grandTotal, 0)
  );
  content += FONTS.NORMAL;

  content += "-----------------------------------------\n";

  // Footer
  content += formatStyledLine(
    "[SFH]",
    `Est.No: ${sample?.tranno || ""}`,
    FONTS.BOLD_ON
  );

  // Feed and cut
  content += PRINTER_COMMANDS.FEED_LINES(3);
  content += PRINTER_COMMANDS.CUT;
  content += "\n\n";

  return content;
};

/**
 * Print estimation slip to thermal printer
 */
const printEstimationToPrinter = async (slipData) => {
  return new Promise((resolve, reject) => {
    const client = TcpSocket.createConnection(PRINTER_CONFIG, () => {
      console.log("Connected to printer");

      try {
        const printContent = buildPrintContent(slipData);

        client.write(printContent, "binary", (error) => {
          if (error) {
            console.error("Write error:", error);
            reject(error);
            return;
          }

          // Wait before closing to ensure data is sent
          setTimeout(() => {
            client.destroy();
            resolve();
          }, 500);
        });
      } catch (error) {
        console.error("Build content error:", error);
        client.destroy();
        reject(error);
      }
    });

    client.on("error", (error) => {
      console.error("Printer connection error:", error);
      client.destroy();
      reject(new Error(`Printer connection failed: ${error.message}`));
    });

    client.on("close", () => {
      console.log("Connection closed");
    });

    client.on("timeout", () => {
      console.error("Connection timeout");
      client.destroy();
      reject(new Error("Printer connection timeout"));
    });
  });
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Main function to print estimation slip with preview
 * @param {string} estBatchNo - Estimation batch number
 * @param {string} username - Current username
 */
export const printEstimationSlip = async (estBatchNo, username) => {
  try {
    console.log("Starting print process for batch:", estBatchNo);
    
    if (!estBatchNo) {
      Alert.alert("Error", "No Estimation No provided for printing.");
      return;
    }

    const slipData = await fetchEstimationData(estBatchNo, username);
    
    if (slipData) {
      console.log("Slip data fetched successfully, showing preview");
      showEstimationPreview(slipData);
    } else {
      Alert.alert("Error", "No data found for printing");
    }
  } catch (error) {
    console.error("Error preparing estimation slip:", error);
    Alert.alert(
      "Error", 
      error.message || "Failed to prepare estimation slip for printing."
    );
  }
};

/**
 * Print directly without preview (for batch printing scenarios)
 * @param {string} estBatchNo - Estimation batch number
 * @param {string} username - Current username
 */
export const printEstimationSlipDirect = async (estBatchNo, username) => {
  try {
    console.log("Starting direct print for batch:", estBatchNo);
    
    const slipData = await fetchEstimationData(estBatchNo, username);
    
    if (slipData) {
      await printEstimationToPrinter(slipData);
      Alert.alert("Success", "Estimation slip printed successfully");
    } else {
      throw new Error("No data found for printing");
    }
  } catch (error) {
    console.error("Direct print error:", error);
    Alert.alert(
      "Print Error", 
      error.message || "Failed to print estimation slip."
    );
    throw error;
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  printEstimationSlip,
  printEstimationSlipDirect,
  useEstimationPreview,
  formatDate,
};10