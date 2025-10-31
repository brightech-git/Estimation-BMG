import TcpSocket from "react-native-tcp-socket";
import {
  Alert,
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import { FONTS, PRINTER_COMMANDS } from "../Themedata";

// Common utility functions
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("en-GB");
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const mergeItems = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = `${item.itemid}-${item.tagno}`;
    if (!map.has(key)) {
      map.set(key, { ...item, taxes: [...(item.taxes || [])] });
    } else {
      const existing = map.get(key);
      existing.pcs += item.pcs || 0;
      existing.netwt += item.netwt || 0;
      existing.grswt += item.grswt || 0;
      existing.amount += item.amount || 0;
      (item.taxes || []).forEach((tax) => {
        const idx = existing.taxes.findIndex((t) => t.tax_id === tax.tax_id);
        if (idx >= 0) existing.taxes[idx].tax_amount += tax.tax_amount || 0;
        else existing.taxes.push({ ...tax });
      });
    }
  });
  return Array.from(map.values());
};

// Preview Modal Component for Estimation Slip
const EstimationPreviewModal = ({ visible, onClose, onPrint, slipData }) => {
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

  const offerWeight = offer.netwt || 0;
  const offerBoardRate = offer.board_rate || 0;
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
            {/* Header Section */}
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
              <Text style={styles.text}>Gold: {goldRate.toFixed(0)}/Gm</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>Time: {getCurrentTime()}</Text>
              <Text style={styles.text}>
                Silver: {silverRate.toFixed(2)}/Gm
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
                  key={`${item.itemid}-${item.tagno}`}
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
                      {item.grswt?.toFixed(3) || "0.000"}
                    </Text>
                    <Text style={[styles.text, styles.colVA]}>
                      {item.wastper && item.wastper > 0
                        ? item.wastper.toFixed(1)
                        : ""}
                    </Text>
                    <Text style={[styles.text, styles.colAmount]}>
                      {item.amount?.toFixed(0) || "0"}
                    </Text>
                  </View>

                  {/* Net Weight */}
                  {item.grswt !== item.netwt && (
                    <View style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>Netwt:</Text>
                      <Text style={[styles.text, styles.colWeight]}>
                        {item.netwt?.toFixed(3) || "0.000"}
                      </Text>
                    </View>
                  )}

                  {/* Stones */}
                  {stones.map((stone, stoneIdx) => (
                    <View key={stoneIdx} style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>STUDDED</Text>
                      <Text style={[styles.text, styles.colWeight]}>
                        {stone.stnwt?.toFixed(3) || "0.000"}
                        {stone.stoneunit || ""}
                      </Text>
                      <Text style={[styles.text, styles.colAmount]}>
                        {stone.stnamt?.toFixed(0) || "0"}
                      </Text>
                    </View>
                  ))}

                  {/* MC */}
                  {item.mcgrm && (
                    <View style={styles.itemRow}>
                      <Text style={[styles.text, styles.colDesc]}>MC:</Text>
                      <Text style={[styles.text, styles.colAmount]}>
                        {item.mcgrm?.toFixed(0)}
                      </Text>
                    </View>
                  )}

                  {/* Subitem Names */}
                  {stones.map((stone, stoneIdx) =>
                    item.subitemname ? (
                      <View key={stoneIdx} style={styles.itemRow}>
                        {item.subitemname?.toUpperCase() || ""}
                      </View>
                    ) : null
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
                  {totalGrossWeight.toFixed(3)}
                </Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {baseAmount.toFixed(0)}
                </Text>
              </View>

              {offerDiscount > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.text, styles.colDesc]}>
                    Offer ({offerWeight.toFixed(3)} * {offerBoardRate})
                  </Text>
                  <Text style={[styles.text, styles.colAmount]}>
                    {offerDiscount.toFixed(1)}
                  </Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={[styles.text, styles.colDesc]}>CGST (1.5%)</Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {cgstAmount.toFixed(0)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.text, styles.colDesc]}>SGST (1.5%)</Text>
                <Text style={[styles.text, styles.colAmount]}>
                  {sgstAmount.toFixed(0)}
                </Text>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.row}>
                <Text style={[styles.boldText, styles.colDesc]}>
                  Sales TOTAL:
                </Text>
                <Text style={[styles.boldText, styles.colAmount]}>
                  {grandTotal.toFixed(0)}
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
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.printButton} onPress={onPrint}>
              <Text style={styles.buttonText}>Print Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    height: "90%",
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
  // Column widths matching receipt format
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
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// Preview management for estimation slips
let estimationPreviewCallback = null;

const showEstimationPreview = (slipData) => {
  if (estimationPreviewCallback) {
    estimationPreviewCallback(slipData);
  }
};

// Hook to use in your component for estimation slips
// Hook to use in your component for estimation slips
export const useEstimationPreview = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [slipData, setSlipData] = useState(null);

  React.useEffect(() => {
    estimationPreviewCallback = (data) => {
      try {
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

  const hidePreview = () => {
    setPreviewVisible(false);
  };

  const executePrint = async () => {
    try {
      setPreviewVisible(false);
      if (slipData) {
        await printEstimationToPrinter(slipData);
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print slip');
    }
  };

  const EstimationPreviewComponent = (
    <EstimationPreviewModal
      visible={previewVisible}
      onClose={hidePreview}
      onPrint={executePrint}
      slipData={slipData}
    />
  );

  return { EstimationPreviewComponent };
};

// Main function to print estimation slip with preview
// Main function to print estimation slip with preview
export const printEstimationSlip = async (estBatchNo, username) => {
  try {
    console.log('Starting print process for batch:', estBatchNo);
    const slipData = await fetchEstimationData(estBatchNo, username);
    if (slipData) {
      console.log('Slip data fetched successfully, showing preview');
      showEstimationPreview(slipData);
    } else {
      Alert.alert('Error', 'No data found for printing');
    }
  } catch (error) {
    console.error('Error preparing estimation slip:', error);
    Alert.alert('Error', 'Failed to prepare estimation slip for printing.');
  }
};

// Fetch estimation data (similar to your PrintSlip function)
const fetchEstimationData = async (estBatchNo, username) => {
  if (!estBatchNo) {
    Alert.alert("Error", "No Estimation No found for printing.");
    return null;
  }

  const api = axios.create({ baseURL: "https://est.bmgjewellers.com/api/v1" });

  try {
    const response = await api.get(`/printDetails/${estBatchNo}`);
    const itemsRaw = Array.isArray(response.data) ? response.data : [];
    if (!itemsRaw.length) {
      Alert.alert("Error", "No data found for this Estimation.");
      return null;
    }

    const items = mergeItems(itemsRaw);
    const sample = items[0];

    // Fetch offer via POST
    let offer = { discount: 0, netwt: 0, board_rate: 0 };
    try {
      const offerRes = await api.post("/offer", null, {
        params: { tagno: sample.tagno },
      });
      offer = offerRes.data || offer;
    } catch (err) {
      console.warn("Failed to fetch offer:", err);
    }

    // Fetch today rates
    let goldRate = 0,
      silverRate = 0;
    try {
      const rateRes = await api.get("/todayrate");
      goldRate = rateRes.data?.GOLDRATE || 0;
      silverRate = rateRes.data?.SILVERRATE || 0;
    } catch {
      goldRate = sample.goldrate || 0;
      silverRate = sample.silverrate || 0;
    }

    const totalpcs = items.reduce((sum, i) => sum + (i.pcs || 0), 0);
    const totalGrossWeight = items.reduce((sum, i) => sum + (i.grswt || 0), 0);
    const baseAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);

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

    // Fetch stones for each item
    const fetchStonesForItem = async (itemid, tagno) => {
      try {
        const res = await api.get("/stnInputs", { params: { itemid, tagno } });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn(
          `Failed to fetch stones for ITEMID=${itemid} TAGNO=${tagno}`,
          err
        );
        return [];
      }
    };

    // Build items with stones
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
    Alert.alert("Error", "Failed to fetch estimation data.");
    return null;
  }
};

// Helper function to format text with proper spacing for printer
// Helper function to format text with styling
const formatStyledLine = (
  leftText,
  rightText,
  style = FONTS.NORMAL,
  totalWidth = 40
) => {
  const left = leftText || "";
  const right = rightText || "";

  let line = style + left;

  if (right) {
    const spacesNeeded = totalWidth - left.length - right.length;
    const spaces = spacesNeeded > 0 ? " ".repeat(spacesNeeded) : " ";
    line += spaces + right;
  }

  return line + FONTS.NORMAL + "\n"; // Reset to normal after each line
};

// Actual printing function for estimation slips - UPDATED WITH FONT STYLING
// Actual printing function for estimation slips with HTML format
const printEstimationToPrinter = async (slipData) => {
  try {
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

    const offerWeight = offer.netwt || 0;
    const offerBoardRate = offer.board_rate || 0;
    const offerDiscount = offerWeight * offerBoardRate;

    // Generate item rows HTML
    const itemRows = itemsWithStones.map((item, idx) => {
      const itemName = (item.itemname || "").toUpperCase();
      const itemNumber = idx + 1;
      const stones = item.stones || [];
      
      let rows = `
        <tr>
          <td colspan="4"><b>${itemNumber} ${itemName} (${item.pcs} Pcs) [${item.itemid}-${item.tagno}]</b></td>
        </tr>
        <tr>
          <td>Rate</td>
          <td align="right">${(item.grswt || 0).toFixed(3)}</td>
          <td align="right">${item.wastper && item.wastper > 0 ? item.wastper.toFixed(1) : ""}</td>
          <td align="right">${(item.amount || 0).toFixed(0)}</td>
        </tr>
      `;

      // Net weight if different
      if (item.grswt !== item.netwt) {
        rows += `
          <tr>
            <td>Netwt:</td>
            <td align="right">${(item.netwt || 0).toFixed(3)}</td>
            <td></td>
            <td></td>
          </tr>
        `;
      }

      // Stones
      stones.forEach((stone) => {
        rows += `
          <tr>
            <td>STUDDED</td>
            <td align="right">${stone.stnwt?.toFixed(3) || "0.000"}${stone.stoneunit || ""}</td>
            <td></td>
            <td align="right">${stone.stnamt?.toFixed(0) || "0"}</td>
          </tr>
        `;
      });

      // MC if exists
      if (item.mcgrm) {
        rows += `
          <tr>
            <td>MC:</td>
            <td></td>
            <td></td>
            <td align="right">${item.mcgrm?.toFixed(0)}</td>
          </tr>
        `;
      }

      // Subitem names
      stones.forEach((stone) => {
        if (item.subitemname) {
          rows += `
            <tr>
              <td colspan="4">${item.subitemname?.toUpperCase() || ""}</td>
            </tr>
          `;
        }
      });

      // Add spacing between items
      rows += `<tr><td colspan="4" style="height: 3px;"></td></tr>`;
      
      return rows;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page {
    margin: 0;
    padding: 0;
  }
  body { 
    font-size: 14px; 
    line-height: 1.2; 
    margin: 2mm; 
    font-family: 'Arial', 'Helvetica', sans-serif; 
    color: #000;
    background: #fff;
  }
  .container {
    width: 100%;
    max-width: 80mm;
  }
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-bottom: 2px;
  }
  td { 
    padding: 1px 0; 
    vertical-align: top; 
    font-size: 13px;
  }
  .totals-table td { 
    padding: 1px 0; 
  }
  .right-align { 
    text-align: right; 
  }
  .center-align { 
    text-align: center; 
  }
  .divider { 
    border-bottom: 1px dashed #000; 
    margin: 3px 0; 
  }
  .double-divider { 
    border-bottom: 2px solid #000; 
    margin: 4px 0; 
  }
  b, strong { 
    font-weight: bold; 
  }
  .header {
    text-align: center;
    margin-bottom: 3px;
  }
  .company-name {
    font-size: 16px;
    font-weight: bold;
    color: #2c3e50;
  }
  .subtitle {
    font-size: 12px;
    color: #7f8c8d;
  }
  .item-desc {
    font-size: 12px;
  }
  .total-row {
    font-weight: bold;
    background-color: #f8f9fa;
  }
  .grand-total {
    font-size: 15px;
    font-weight: bold;
    background-color: #e9ecef;
  }
  .footer {
    margin-top: 5px;
    text-align: center;
    font-size: 11px;
    color: #666;
  }
</style>
</head>
<body>
<div class="container">

  <!-- Header with Logo/Company Name -->
  <div class="header">
    <div class="company-name">BMG JEWELLERS</div>
    <div class="subtitle">ESTIMATION SLIP</div>
  </div>

  <!-- Customer Information -->
  <table>
    <tr><td><b>NAME</b> : __________________________________</td></tr>
    <tr><td><b>MOBILE</b> : _________________________________</td></tr>
  </table>

  <div class="divider"></div>

  <!-- Estimation Details -->
  <table>
    <tr>
      <td width="60%"><b>ESTIMATION SLIP</b></td>
      <td width="40%" align="right"><b>Est.No :</b> ${sample?.tranno || ""} - ${sample?.company_id || "BMG"}</td>
    </tr>
    <tr>
      <td><b>Date :</b> ${formatDate(sample?.trandate)}</td>
      <td align="right"><b>Gold :</b> ${goldRate.toFixed(0)}/Gm</td>
    </tr>
    <tr>
      <td><b>Time :</b> ${getCurrentTime()}</td>
      <td align="right"><b>Silver :</b> ${silverRate.toFixed(2)}/Gm</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <!-- Table Header -->
  <table>
    <tr>
      <td width="45%"><b>Description</b></td>
      <td width="20%" align="right"><b>Weight</b></td>
      <td width="15%" align="right"><b>V.A</b></td>
      <td width="20%" align="right"><b>Amount</b></td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Items List -->
  <table class="item-desc">
    ${itemRows}
  </table>

  <div class="double-divider"></div>

  <!-- Totals Section -->
  <table class="totals-table">
    <tr class="total-row">
      <td width="45%"><b>Tot.Pcs : ${totalpcs}</b></td>
      <td width="20%" align="right">${totalGrossWeight.toFixed(3)}</td>
      <td width="15%"></td>
      <td width="20%" align="right">${baseAmount.toFixed(0)}</td>
    </tr>

    ${offerDiscount > 0 ? `
    <tr>
      <td colspan="3"><b>Offer (${offerWeight.toFixed(3)} * ${offerBoardRate})</b></td>
      <td align="right">${offerDiscount.toFixed(1)}</td>
    </tr>` : ''}

    <tr>
      <td colspan="3" align="center"><b>CGST (1.5%)</b></td>
      <td align="right">${cgstAmount.toFixed(0)}</td>
    </tr>
    <tr>
      <td colspan="3" align="center"><b>SGST (1.5%)</b></td>
      <td align="right">${sgstAmount.toFixed(0)}</td>
    </tr>
    
    <tr><td colspan="4" class="double-divider"></td></tr>
    
    <tr class="grand-total">
      <td><b>Sales TOTAL :</b></td>
      <td></td>
      <td align="right"><b></b></td>
      <td align="right"><b>${grandTotal.toFixed(0)}</b></td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Footer -->
  <table class="footer">
    <tr>
      <td><b>[BMG JEWELLERS]</b></td>
      <td align="right"><b>Est.No : ${sample?.tranno || ""}</b></td>
    </tr>
    <tr>
      <td colspan="2" align="center">Thank you for your business!</td>
    </tr>
  </table>

</div>
</body>
</html>
    `;

    // Print using react-native-print or similar library
    await Print.printAsync({ 
      html: htmlContent,
      orientation: Print.Orientation.portrait,
      margins: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    });

  } catch (error) {
    console.error("Print error:", error);
    Alert.alert("Error", "Failed to print slip.");
  }
};