import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

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

// Preview Modal Component for Estimation Slip
const EstimationPreviewModal = ({ visible, onClose, onPrint, slipData, currentPrinter }) => {
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
          
          {currentPrinter && (
            <Text style={styles.printerInfo}>
              Printer: {currentPrinter.name} ({currentPrinter.host}:{currentPrinter.port})
            </Text>
          )}

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
                    <View key={`stone-${stoneIdx}`} style={styles.itemRow}>
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
                      <View key={`subitem-${stoneIdx}`} style={styles.itemRow}>
                        <Text style={[styles.text, styles.colDesc]}>
                          {item.subitemname?.toUpperCase() || ""}
                        </Text>
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
    fontWeight: 'bold',
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  printerInfo: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
    fontStyle: "italic",
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
    fontWeight: 'bold',
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
  },
  colWeight: {
    flex: 1.5,
    textAlign: "right",
  },
  colVA: {
    flex: 1,
    textAlign: "right",
  },
  colAmount: {
    flex: 1.5,
    textAlign: "right",
  },
  text: {
    fontSize: 10,
    color: "#333",
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: "#333",
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
    fontSize: 16,
  },
});

export default EstimationPreviewModal;