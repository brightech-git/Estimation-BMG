import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, ScrollView,
    ActivityIndicator, Alert, FlatList, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import MainHeader from '../../Components/Header/Header'
import { LoginContext } from '../../../Context/LoginContext';
import { useContext } from 'react';
import Footer from '../../Components/Footer/Footer'
import { Modal } from 'react-native';
import BarcodeScannerModal from '../../Components/BarCodeScanner/BarcodeScannerModal';
import { printEstimationSlip, useEstimationPreview } from '../../Components/PrintReceipt/PrintSlip';
import { useApiBaseUrl } from '../../../Config/Config';
import { useTheme } from "../../../Context/ThemeContext";
import { createHomeStyles } from './HomeStyles'; // Adjust path as needed

const HomeScreen = () => {
    // 👇 Get theme from context
    const { theme, isDarkMode } = useTheme();
    
    // 👇 Create styles based on current theme object
    const styles = createHomeStyles(theme);

    // State declarations
    const [ITEMID, setITEMID] = useState('');
    const [TAGNO, setTAGNO] = useState('');
    const [emp, setEmp] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [showList, setShowList] = useState(false);
    const { username, userId, companyId, companyName } = useContext(LoginContext);
    const [tranno, setTranno] = useState(null);
    const [estBatchNo, setEstBatchNo] = useState(null);
    
    // Refs
    const itemIdInputRef = useRef(null);
    const tagInputRef = useRef(null);
    const empInputRef = useRef(null);
    
    // Scanner state
    const [scanningField, setScanningField] = useState(null);
    const [scannerVisible, setScannerVisible] = useState(false);
    
    // API and print hooks
    const API_BASE_URL = useApiBaseUrl();
    const { EstimationPreviewComponent } = useEstimationPreview();

    const api = axios.create({
        baseURL: `${API_BASE_URL}`
    });

    // Focus on item ID input on mount
    useEffect(() => {
        itemIdInputRef.current?.focus();
    }, []);

    // Scanner handler
    const handleScanned = (field, data) => {
        if (data.includes('-')) {
            const [item, tag] = data.split('-');
            setITEMID(item);
            setTAGNO(tag);
            empInputRef.current?.focus();
        } else {
            if (field === 'itemid') {
                setITEMID(data);
                tagInputRef.current?.focus();
            } else if (field === 'tagno') {
                setTAGNO(data);
                empInputRef.current?.focus();
            }
        }
    };

    // Utility functions
    const parseValue = (value) => {
        if (!value || value === 'null') return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const calculateGrossAmount = (row) => {
        const netWt = parseValue(row.NETWT);
        const wastage = parseValue(row.Wastage);
        const rate = parseValue(row.Rate);
        const mc = parseValue(row.MC);
        const stoneAmt = parseValue(row.StoneAmount);
        const miscAmt = parseValue(row.MiscAmount);
        return (netWt + wastage) * rate + mc + stoneAmt + miscAmt;
    };

    const calculateGST = (row) => {
        const gross = calculateGrossAmount(row);
        let gstPer = parseFloat(row.GSTPer);
        if (isNaN(gstPer)) gstPer = 0;
        return (gross * gstPer) / 100;
    };

    const calculateGrandTotal = (row) => {
        return calculateGrossAmount(row) + calculateGST(row);
    };

    // Data fetching functions
    const fetchItemList = async () => {
        try {
            const response = await api.get('/list');
            const data = response.data;
            const uniqueItemIds = Array.from(new Set(data.map(item => item.ITEMID)));
            setItemList(uniqueItemIds);
            setShowList(true);
        } catch (error) {
            Alert.alert('Failed to load ITEM IDs', error.message || 'Unknown error');
        }
    };

    const fetchData = async () => {
        if (!ITEMID.trim() || !TAGNO.trim() || !emp.trim()) {
            Alert.alert('Missing Input', 'Please enter valid Item ID, Tag No, and Employee.');
            return;
        }

        const itemIdInt = parseInt(ITEMID, 10);
        if (isNaN(itemIdInt)) {
            Alert.alert('Invalid Item ID', 'Item ID must be a number.');
            return;
        }

        setLoading(true);

        try {
            // Check if tag already exists
            let tagDetails = null;
            try {
                const checkResponse = await api.get(`/tag-details`, { params: { ITEMID, TAGNO } });
                tagDetails = checkResponse.data;
            } catch (error) {
                if (error.response?.status !== 404) throw error;
            }

            if (tagDetails && tagDetails.trandate) {
                Alert.alert('Tag Already Issued', `Issued on ${tagDetails.trandate}, Trn No: ${tagDetails.tranno}`);
                return;
            }

            // Check for duplicates in current table
            const alreadyExists = tableData.some(row =>
                row.ITEMID === itemIdInt && row.TAGNO === TAGNO && row.EMPID === emp
            );

            if (alreadyExists) {
                Alert.alert('Duplicate Entry', 'This Tag is already loaded in the Sales Grid.');
                return;
            }

            // Fetch estimation data
            const response = await api.get('/estimationTotal', {
                params: { ITEMID, TAGNO }
            });

            const data = response.data;
            if (!Array.isArray(data) || data.length === 0) {
                Alert.alert('No data found.');
                return;
            }

            const newData = data.map(d => ({
                ...d,
                ITEMID: itemIdInt,
                TAGNO,
                EMPID: emp,
                EMP: emp,
                METALID: d.METALID || 0
            }));

            setTableData(prev => [...prev, ...newData]);

            // Reset form and focus
            setITEMID('');
            setTAGNO('');
            setEmp('');
            itemIdInputRef.current?.focus();

        } catch (error) {
            Alert.alert('Error', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // Submission functions
    const fetchEstBatchNo = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get('/estbatchno', {
                params: {
                    costId: 'FL',
                    billDate: today,
                    companyId: 'BMG',
                    isEstimate: true
                }
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch ESTBATCHNO:', error.message);
            return null;
        }
    };

    const formatDateToSqlDateTime = (dateInput) => {
        const dt = dateInput ? new Date(dateInput) : new Date();
        if (isNaN(dt)) return null;
        return dt.toISOString().replace('T', ' ').split('.')[0];
    };

    const formatDateToMidnightSql = (dateInput = new Date()) => {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`;
    };

    const submitData = async () => {
        console.log('Submitting data:', tableData);
        if (tableData.length === 0) {
            Alert.alert("No data", "Please add items before submitting.");
            return null;
        }

        try {
            setLoading(true);

            // Get transaction number
            const trannoResponse = await api.get('/tranno');
            console.log('TRANNO Response:', trannoResponse.data);
            const TRANNO = trannoResponse.data;
            if (!TRANNO) throw new Error("Failed to get TRANNO");

            // Get estimation batch number
            const estBatchNo = await fetchEstBatchNo();
            if (!estBatchNo) {
                Alert.alert('Error', 'Could not retrieve ESTBATCHNO');
                return null;
            }

            // Enrich items with additional data
            const enrichedData = await Promise.all(
                tableData.map(async (item) => {
                    console.log(`Fetching stone inputs for ITEMID=${item.ITEMID} TAGNO=${item.TAGNO}`);

                    let stoneInputs = [];
                    try {
                        const stoneRes = await api.get('/stnInputs', {
                            params: { itemid: item.ITEMID, tagno: item.TAGNO }
                        });
                        stoneInputs = stoneRes.data || [];
                    } catch (err) {
                        console.warn(`Failed to fetch stone inputs`, err);
                    }

                    // Fetch stone category codes
                    for (const stn of stoneInputs) {
                        if (!stn?.stnitemid) continue;
                        try {
                            const response = await api.get('/stone-catcode', {
                                params: { itemId: item.ITEMID, stnItemId: stn.stnitemid }
                            });
                            stn.catcode = response.data?.stoneCatCode || "";
                        } catch (err) {
                            console.warn(`Failed to fetch catCode`, err);
                        }
                    }

                    // Fetch tag details
                    let tagDetails = {};
                    try {
                        const tagDetailsResponse = await api.get(`/tagDetails/${item.TAGNO}`);
                        tagDetails = tagDetailsResponse.data || {};
                    } catch (err) {
                        console.warn(`Failed to fetch tag details`, err);
                    }

                    // Get transaction date
                    let trandateString = formatDateToSqlDateTime();
                    try {
                        const trandateResponse = await api.get('/trandate', {
                            params: { ITEMID: item.ITEMID, TAGNO: item.TAGNO }
                        });
                        const dateFromApi = trandateResponse.data?.trandate;
                        if (dateFromApi) {
                            trandateString = formatDateToSqlDateTime(dateFromApi);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch trandate`, err);
                    }

                    // Build item payload
                    const rawItem = {
                        TRANNO,
                        TRANDATE: formatDateToMidnightSql(item.trandate),
                        TRANTYPE: "SA",
                        PCS: parseFloat(item.PCS) || 0,
                        GRSWT: parseFloat(item.GRSWT) || 0,
                        NETWT: parseFloat(item.NETWT) || 0,
                        PUREWT: parseFloat(item.PUREWT || item.NETWT) || 0,
                        TAGNO: item.TAGNO || '',
                        ITEMID: item.ITEMID || 0,
                        WASTPER: tagDetails?.wastper,
                        WASTAGE: parseFloat(item.Wastage) || 0,
                        MCGRM: parseFloat(item.MC) || parseFloat(tagDetails?.mcgram) || 0,
                        MCHRGE: tagDetails?.mcharge,
                        AMOUNT: parseFloat(calculateGrossAmount(item).toFixed(2)) || 0,
                        RATE: parseFloat(item.Rate) || 0,
                        BOARDRATE: parseFloat(item.Rate) || 0,
                        COSTID: "",
                        COMPANYID: tagDetails?.companyid || "BMG",
                        EMPID: Number(item.EMP) || 0,
                        STNAMT: parseFloat(item.StoneAmount) || 0,
                        MISCAMT: parseFloat(item.MiscAmount) || 0,
                        LESSWT: tagDetails?.lesswt,
                        SUBITEMID: tagDetails?.subitemid,
                        SALEMODE: tagDetails?.salemode,
                        GRSNET: tagDetails?.grsnet,
                        TAGDESIGNER: tagDetails?.designerid,
                        ITEMTYPEID: tagDetails?.itemtypeid,
                        ITEMCTRID: tagDetails?.itemctrid,
                        PURITY: tagDetails?.purity,
                        TAGSVALUE: tagDetails?.salvalue,
                        TRANSTATUS: "",
                        REFNO: "",
                        REFDATE: null,
                        FLAG: "",
                        TAGGRSWT: parseFloat(item.GRSWT) || 0,
                        TAGNETWT: parseFloat(item.NETWT) || 0,
                        TAGRATEID: 0.00,
                        TABLECODE: "",
                        INCENTIVE: "",
                        WEIGHTUNIT: "",
                        CATCODE: parseFloat(item.CATCODE) || 0,
                        OCATCODE: "",
                        ACCODE: "",
                        ALLOY: "0.000",
                        BATCHNO: "",
                        REMARK1: "",
                        REMARK2: "",
                        USERID: userId ? parseValue(userId) : 0,
                        UPDATED: formatDateToMidnightSql(item.updated),
                        UPTIME: "",
                        SYSTEMID: "",
                        DISCOUNT: "0.00",
                        RUNNO: "",
                        CANCEL: "",
                        CASHID: "",
                        VATEXM: "",
                        ORSNO: "",
                        ORDERNO: "",
                        STONEUNIT: null,
                        PROTYPE: "0",
                        METALID: item.METALID || "0",
                        TAX: parseFloat(calculateGST(item).toFixed(2)) || 0,
                        SC: "0.00",
                        ADSC: "0.00",
                        APPVER: "",
                        PSNO: "",
                        DISCEMPID: "",
                        MARGINID: "0",
                        OTHERAMT: "",
                        RATEID: 0.00,
                        ESTBATCHNO: estBatchNo,
                        OESTBATCHNO: null,
                        SETGRPID: "",
                        STATUS: "",
                        DUEDATE: formatDateToMidnightSql(item.duedate),
                        TOUCH: "0.00",
                        STKTYPE: "",
                        BARPREFIX: "",
                        HSN: null,
                    };

                    return [rawItem, stoneInputs];
                })
            );

            const rawItems = enrichedData.map(([item]) =>
                Object.fromEntries(Object.entries(item).filter(([_, v]) => v !== undefined && v !== null))
            );

            console.log("📤 Payload to /estissue:", JSON.stringify(rawItems, null, 2));

            // Submit main estimation data
            const estIssueResponse = await api.post('/estissue', rawItems);
            console.log("📦 Full estIssueResponse.data:", JSON.stringify(estIssueResponse.data, null, 2));

            const savedIssues = Array.isArray(estIssueResponse.data)
                ? estIssueResponse.data
                : (estIssueResponse.data?.data || []);

            console.log("📦 Saved issues received:", savedIssues);

            if (!Array.isArray(savedIssues)) {
                throw new Error("❌ Invalid EstIssue response: expected an array but got " + JSON.stringify(estIssueResponse.data));
            }

            // Create mapping for SNOs
            const snoMap = {};
            estIssueResponse.data.forEach(issue => {
                snoMap[issue.TAGNO || issue.tagno] = issue.SNO || issue.sno;
            });

            const tagToRawItemMap = {};
            enrichedData.forEach(([rawItem]) => {
                const tag = rawItem?.TAGNO;
                if (tag) {
                    tagToRawItemMap[tag.toString().trim()] = rawItem;
                } else {
                    console.warn("❗ rawItem is missing TAGNO:", rawItem);
                }
            });

            // Submit stone data
            const allStonePayloads = [];
            for (const [item, stoneInputs] of enrichedData) {
                const tagno = item.TAGNO;
                const estSNO = snoMap[tagno];

                let generatedSNO = "";
                try {
                    const snoResponse = await api.get('/generate-estissstone-sno', {
                        params: {
                            costId: "",
                            companyId: item.COMPANYID || "BMG"
                        }
                    });
                    generatedSNO = snoResponse.data || "";
                } catch (err) {
                    console.warn(`Failed to generate SNO`, err);
                    continue;
                }

                if (!Array.isArray(stoneInputs) || stoneInputs.length === 0) continue;

                const stonePayloads = stoneInputs.map(stone => ({
                    sno: generatedSNO,
                    isssno: estSNO,
                    ismsno: "",
                    tranno: TRANNO,
                    TRANDATE: formatDateToMidnightSql(item.TRANDATE),
                    trantype: "SA",
                    stnpcs: stone.stnpcs || 0,
                    stnwt: stone.stnwt || 0,
                    stnrate: stone.stnrate || 0,
                    stnamt: stone.stnamt || 0,
                    stnitemid: stone.stnitemid || 0,
                    stnsubitemid: stone.stnsubitemid || 0,
                    calcmode: stone.calcmode || "",
                    stoneunit: stone.stoneunit || "",
                    stonemode: "",
                    transtatus: "",
                    costid: stone.costid || "",
                    companyid: stone.companyid || "",
                    batchno: "",
                    systemid: "",
                    vatexm: "",
                    catcode: stone.catcode || "",
                    protype: "",
                    ocatcode: "",
                    tax: 0,
                    sc: 0,
                    adsc: 0,
                    appver: "",
                    discount: 0.0,
                    tagstnpcs: 0,
                    tagstnwt: 0,
                    tagsno: stone.tagsno || "",
                    estbatchno: estBatchNo || "",
                    cutid: 0,
                    colorid: 0,
                    clarityid: 0,
                    settypeid: 0,
                    shapeid: 0,
                    height: 0,
                    width: 0
                }));

                allStonePayloads.push(...stonePayloads);
            }

            if (allStonePayloads.length > 0) {
                await api.post('/eststnissue', allStonePayloads, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
            }

            // Submit tax data
            for (const tagno in snoMap) {
                const estSNO = snoMap[tagno];
                const rawItem = tagToRawItemMap[tagno.toString().trim()];

                if (!rawItem) {
                    console.warn(`❌ rawItem not found for TAGNO=${tagno}`);
                    continue;
                }

                const amount = parseFloat(rawItem.AMOUNT) || 0;
                if (amount <= 0) {
                    console.warn(`⛔ Skipping tax entry for TAGNO=${tagno} because amount is 0`);
                    continue;
                }

                let estTaxTranSno = "";
                try {
                    const snoResponse = await api.get('/generate-esttaxtran-sno', {
                        params: { costId: "", companyId: "BMH" }
                    });
                    estTaxTranSno = String(snoResponse.data || "");
                    console.log("✅ Generated ESTTAXTRAN SNO:", estTaxTranSno);
                } catch (err) {
                    console.warn("❌ Failed to generate ESTTAXTRAN SNO:", err);
                    continue;
                }

                // Get tax details
                let taxDetails = {};
                try {
                    const taxRes = await api.get(`/getEstTaxTranDetails/${rawItem.ITEMID}`);
                    taxDetails = taxRes?.data?.[0] || {};
                    console.log(`✅ Tax details for ITEMID=${rawItem.ITEMID}:`, taxDetails);
                } catch (err) {
                    console.warn(`❌ Failed to fetch tax details for ITEMID=${rawItem.ITEMID}`, err);
                }

                // Build tax payload
                const basePayload = {
                    sno: estTaxTranSno,
                    isssno: String(estSNO),
                    tranno: Number(TRANNO),
                    trandate: formatDateToMidnightSql(rawItem.TRANDATE),
                    trantype: "SA",
                    batchno: String(estBatchNo),
                    amount: parseFloat(amount.toFixed(2)),
                    taxtype: null,
                    costid: String(rawItem.COSTID),
                    companyid: String(rawItem.COMPANYID),
                    studded: null
                };

                const generateTaxEntries = (payload, sgst = 1.5, cgst = 1.5) => {
                    const amt = payload.amount;
                    return [
                        {
                            ...payload,
                            taxid: "SG",
                            taxper: sgst,
                            taxamount: parseFloat((amt * sgst / 100).toFixed(2)),
                            tsno: 1
                        },
                        {
                            ...payload,
                            taxid: "CG",
                            taxper: cgst,
                            taxamount: parseFloat((amt * cgst / 100).toFixed(2)),
                            tsno: 2
                        }
                    ];
                };

                const taxEntries = generateTaxEntries(basePayload);

                try {
                    for (const entry of taxEntries) {
                        console.log("📤 Posting tax entry:", JSON.stringify(entry, null, 2));
                        await api.post('/estTaxTran', entry);
                    }
                    console.log("✅ SGST and CGST entries inserted for TAGNO:", rawItem.TAGNO);
                } catch (err) {
                    console.warn("❌ Failed to insert SGST/CGST tax entries:", err.response?.data || err.message);
                    Alert.alert("Warning", `Tax insert failed for TAGNO: ${rawItem.TAGNO}`);
                }
            }

            // Update transaction number
            try {
                await api.post('/updateTranno');
            } catch (err) {
                Alert.alert("Partial Success", "Data submitted, but TRANNO update failed.");
            }

            // Get final details for printing
            const [ipResponse, detailResponse, rateResponse] = await Promise.all([
                api.get('/ipaddress'),
                api.get(`/details/${TRANNO}`),
                api.get('/todayrate')
            ]);

            const estDetails = detailResponse?.data?.[0] || {};
            const ipAddress = ipResponse?.data?.ip || ipResponse?.data || "";
            let rawBillDate = estDetails?.billDate;
            let billDate = (!rawBillDate || isNaN(Date.parse(rawBillDate)))
                ? new Date().toISOString().replace('T', ' ').slice(0, 19)
                : new Date(rawBillDate).toISOString().replace('T', ' ').slice(0, 19);

            // Save batch number for printing
            const batchNo = estDetails?.est_batch_no || "";
            setEstBatchNo(batchNo);

            // Submit print data
            const estPrintPayload = {
                brefno: TRANNO,
                billdate: billDate,
                goldrate: rateResponse?.data?.GOLDRATE || 0,
                silverrate: rateResponse?.data?.SILVERRATE || 0,
                billtype: estDetails?.bill_type || "",
                instrument: "X",
                sysipaddress: ipAddress,
                estbatchno: batchNo,
            };

            await api.post('/estprint', estPrintPayload);

            Alert.alert("Success", `Sales Estimation No: ${TRANNO} Generated`);
            setTranno(TRANNO);
            setEstBatchNo(estBatchNo);
            setTableData([]);

            return estBatchNo;

        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message || "Something went wrong.");
            console.error("Submitting error:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Print handler
    const handlePrint = async () => {
        console.log('🖨️ Print button clicked, estBatchNo:', estBatchNo);
        console.log('👤 Username:', username);
        console.log('🌐 API Base URL:', API_BASE_URL);
        
        if (!estBatchNo) {
            Alert.alert("No slip available", "Please submit first to generate a slip");
            return;
        }

        if (!API_BASE_URL) {
            Alert.alert("Configuration Error", "API base URL is not configured");
            return;
        }

        try {
            console.log('📞 Calling printEstimationSlip...');
            await printEstimationSlip(estBatchNo, username, API_BASE_URL);
        } catch (err) {
            console.error("❌ Print error:", err);
            Alert.alert("Print Failed", err.message || "Unable to generate slip");
        }
    };

    // Calculate totals
    const totalGross = tableData.reduce((acc, row) => acc + calculateGrossAmount(row), 0);
    const totalGST = tableData.reduce((acc, row) => acc + calculateGST(row), 0);
    const totalGrand = tableData.reduce((acc, row) => acc + calculateGrandTotal(row), 0);

    return (
        <>
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                <MainHeader />
                <View style={styles.container}>
                    {/* Totals Display */}
                    {tableData.length > 0 && (
                        <View style={styles.totalsContainer}>
                            <View style={styles.totalsRow}>
                                <View style={styles.totalItem}>
                                    <Text style={styles.totalLabel}>Gross Amount</Text>
                                    <Text style={styles.totalValue}>
                                        ₹{totalGross.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={styles.totalItem}>
                                    <Text style={styles.totalLabel}>GST Amount</Text>
                                    <Text style={styles.totalValue}>
                                        ₹{totalGST.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={styles.totalItem}>
                                    <Text style={styles.totalLabel}>Grand Total</Text>
                                    <Text style={[styles.totalValue, styles.grandTotal]}>
                                        ₹{totalGrand.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Input Fields */}
                    <View style={styles.inputRow}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                ref={itemIdInputRef}
                                style={styles.input}
                                placeholder="Item ID"
                                placeholderTextColor={theme.COLORS.placeholder}
                                value={ITEMID}
                                onChangeText={(text) => {
                                    setITEMID(text);
                                    setShowList(false);
                                }}
                                onSubmitEditing={() => {
                                    if (ITEMID.trim() === '') fetchItemList();
                                    else tagInputRef.current?.focus();
                                }}
                                returnKeyType="next"
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setScanningField('itemid');
                                    setScannerVisible(true);
                                }}
                                style={styles.scanButton}
                            >
                                <Text style={styles.scanIcon}>📷</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                ref={tagInputRef}
                                style={styles.input}
                                placeholder="Tag No"
                                placeholderTextColor={theme.COLORS.placeholder}
                                value={TAGNO}
                                onChangeText={setTAGNO}
                                onSubmitEditing={() => empInputRef.current?.focus()}
                                returnKeyType="next"
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setScanningField('tagno');
                                    setScannerVisible(true);
                                }}
                                style={styles.scanButton}
                            >
                                <Text style={styles.scanIcon}>📷</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                ref={empInputRef}
                                style={styles.input}
                                placeholder="Emp ID"
                                placeholderTextColor={theme.COLORS.placeholder}
                                value={emp}
                                onChangeText={setEmp}
                                onSubmitEditing={fetchData}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Item Suggestions Dropdown */}
                    {showList && itemList.length > 0 && (
                        <View style={styles.dropdown}>
                            <FlatList
                                data={itemList}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setITEMID(item);
                                            setShowList(false);
                                            tagInputRef.current?.focus();
                                        }}
                                        style={styles.dropdownItem}
                                    >
                                        <Text style={styles.dropdownText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                nestedScrollEnabled={true}
                            />
                        </View>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <ActivityIndicator size="large" color={theme.COLORS.primary} style={styles.loader} />
                    )}

                    {/* Data Table */}
                    {tableData.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableContainer}>
                            <View>
                                <View style={styles.headerRow}>
                                    {[
                                        'Item ID', 'Tag No', 'Pcs', 'Grswt', 'NetWt', 'Rate', 'Wastage',
                                        'MC', 'Stone', 'Misc', 'Gross', 'GST', 'GrandTotal', 'Emp'
                                    ].map((label, idx) => (
                                        <Text key={idx} style={styles.headerCell}>{label}</Text>
                                    ))}
                                </View>

                                {tableData.map((item, rowIdx) => (
                                    <View key={rowIdx} style={styles.dataRow}>
                                        <Text style={styles.cell}>{item.ITEMID ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.TAGNO ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.PCS ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.GRSWT ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.NETWT ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.Rate ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.Wastage ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.MC ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.StoneAmount ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{item.MiscAmount ?? 'N/A'}</Text>
                                        <Text style={styles.cell}>{calculateGrossAmount(item).toFixed(2)}</Text>
                                        <Text style={styles.cell}>{calculateGST(item).toFixed(2)}</Text>
                                        <Text style={styles.cell}>{calculateGrandTotal(item).toFixed(2)}</Text>
                                        <Text style={styles.cell}>{item.EMP ?? 'N/A'}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    )}

                    {/* Transaction Number Display */}
                    {tranno && (
                        <View style={styles.trannoContainer}>
                            <Text style={styles.trannoText}>
                                Last Submitted TRANNO: {tranno}
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={async () => {
                                const batchNo = await submitData();
                                if (batchNo) {
                                    setEstBatchNo(batchNo);
                                    console.log('ESTBATCHNO:', batchNo);
                                }
                            }}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Submitting...' : 'Submit'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, styles.printButton, !estBatchNo && styles.disabledButton]}
                            onPress={handlePrint}
                            disabled={!estBatchNo}
                        >
                            <Text style={styles.submitButtonText}>Print Slip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Scanner Modal */}
                    <BarcodeScannerModal
                        visible={scannerVisible}
                        onClose={() => setScannerVisible(false)}
                        scanningField={scanningField}
                        onScanned={handleScanned}
                    />

                    {/* Print Preview Component */}
                    {EstimationPreviewComponent}
                </View>
            </ScrollView>
            <Footer />
        </>
    );
};

export default HomeScreen;