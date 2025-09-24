import React, { useState, useRef, useEffect } from 'react';

import {
    View, Text, TextInput, ScrollView, StyleSheet,
    ActivityIndicator, Alert, FlatList, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import EstimationScreen from './EstimationScreen';
import { UserContext } from '../screens/UserContext';
import { useContext } from 'react';

import { Modal} from 'react-native';
import BarcodeScannerModal from './BarcodeScannerModal';
import { PrintSlip } from './PrintSlip';

const api = axios.create({
    baseURL: 'https://est.bmgjewellers.com/api/v1'
});



const HomeScreen = () => {
    const [ITEMID, setITEMID] = useState('');
    const [TAGNO, setTAGNO] = useState('');
    const [emp, setEmp] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [showList, setShowList] = useState(false);
    const { userId } = useContext(UserContext);
    const [empID, setEmpID] = useState(null);
    const [empList, setEmpList] = useState([]); // to hold array of employees
    const [selectedEmpID, setSelectedEmpID] = useState(null); // to hold chosen EMPID
    const [tranno, setTranno] = useState(null); // ✅ ADD THIS LINE
    const [filteredEmpList, setFilteredEmpList] = useState([]);
    const [showEmpList, setShowEmpList] = useState(false);
    const itemIdInputRef = useRef(null);
    const tagInputRef = useRef(null);
    const empInputRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [scanningField, setScanningField] = useState(null); // 'itemid' or 'tagno'
    const [scannerVisible, setScannerVisible] = useState(false);
    const [estBatchNo, setEstBatchNo] = useState(null);
    const { username } = useContext(UserContext);

   
    

    useEffect(() => {
        itemIdInputRef.current?.focus();
    }, []);


    // const handleScanned = (field, data) => {
    //     if (field === 'itemid') setITEMID(data);
    //     else if (field === 'tagno') setTAGNO(data);
    //   };

    // const handleScanned = (field, data) => {
    //     if (field === 'itemid') {
    //         setITEMID(data);
    //         tagInputRef.current?.focus();
    //     } else if (field === 'tagno') {
    //         setTAGNO(data);
    //         empInputRef.current?.focus();
    //     }
    // };

    const handleScanned = (field, data) => {
        // Check if data is in the format "22-165"
        if (data.includes('-')) {
            const [item, tag] = data.split('-');

            setITEMID(item);
            setTAGNO(tag);

            empInputRef.current?.focus();  // Jump to Emp field
        } else {
            // fallback if scanning separately
            if (field === 'itemid') {
                setITEMID(data);
                tagInputRef.current?.focus();
            } else if (field === 'tagno') {
                setTAGNO(data);
                empInputRef.current?.focus();
            }
        }
    };

    const parseValue = (value) => {
        if (!value || value === 'null') return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

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
            // 🔍 1. Check if already issued (same as current logic)
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

            // 🔍 2. Check if item already exists in the grid (like your .NET logic)
            const alreadyExists = tableData.some(row =>
                row.ITEMID === itemIdInt && row.TAGNO === TAGNO && row.EMPID === emp
            );

            if (alreadyExists) {
                Alert.alert('Duplicate Entry', 'This Tag is already loaded in the Sales Grid.');
                return;
            }

            // ✅ 3. Fetch and add new estimation rows
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

            // ✅ 4. Append non-duplicate new records
            setTableData(prev => [...prev, ...newData]);

            // 🔄 5. Reset fields
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

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.ITEMID}</Text>
            <Text style={styles.cell}>{item.TAGNO}</Text>
            <Text style={styles.cell}>{item?.PCS || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.GRSWT || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.NETWT || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.Rate || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.Wastage || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.MC || 'N/A'}</Text>
            <Text style={styles.cell}>{item?.StoneAmount || '0'}</Text>
            <Text style={styles.cell}>{item?.MiscAmount || '0'}</Text>
            <Text style={styles.cell}>{calculateGrossAmount(item).toFixed(2)}</Text>
            <Text style={styles.cell}>{calculateGST(item).toFixed(2)}</Text>
            <Text style={styles.cell}>{calculateGrandTotal(item).toFixed(2)}</Text>
            <Text style={styles.cell}>{item.EMP}</Text>
        </View>
    );

    const renderTotalRow = () => {
        const sum = (key) => tableData.reduce((acc, curr) => acc + parseValue(curr[key]), 0);
        const totalGross = tableData.reduce((acc, row) => acc + calculateGrossAmount(row), 0);
        const totalGST = tableData.reduce((acc, row) => acc + calculateGST(row), 0);
        const totalGrand = tableData.reduce((acc, row) => acc + calculateGrandTotal(row), 0);

        return (
            <View style={[styles.row, { backgroundColor: '#ddd' }]}>
                <Text style={styles.cell}>Total</Text>
                <Text style={styles.cell}>-</Text>
                <Text style={styles.cell}>{sum('PCS')}</Text>
                <Text style={styles.cell}>{sum('GRSWT').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('NETWT').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('Rate').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('Wastage').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('MC').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('StoneAmount').toFixed(2)}</Text>
                <Text style={styles.cell}>{sum('MiscAmount').toFixed(2)}</Text>
                <Text style={styles.cell}>{totalGross.toFixed(2)}</Text>
                <Text style={styles.cell}>{totalGST.toFixed(2)}</Text>
                <Text style={styles.cell}>{totalGrand.toFixed(2)}</Text>
                <Text style={styles.cell}>-</Text>
            </View>
        );
    };

    const fetchEstBatchNo = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const response = await api.get('/estbatchno', {
                params: {
                    costId: 'FL',
                    billDate: today,
                    companyId: 'BMG',
                    isEstimate: true
                }
            });
            return response.data;
            console.log('ESTBATCHNO Response:', response.data);
        } catch (error) {
            console.warn('Failed to fetch ESTBATCHNO:', error.message);
            return null;
        }
    };
    const totalGross = tableData.reduce((acc, row) => acc + calculateGrossAmount(row), 0);
    const totalGST = tableData.reduce((acc, row) => acc + calculateGST(row), 0);
    const totalGrand = tableData.reduce((acc, row) => acc + calculateGrandTotal(row), 0);


    // useEffect(() => {
    //     const fetchEmpList = async () => {
    //         try {
    //             const response = await axios.get('https://est.bmgjewellers.com/api/v1/empID');
    //             setEmpList(response.data); // array of employee objects
    //         } catch (error) {
    //             console.error('Failed to fetch emp list:', error);
    //         }
    //     };
    //     fetchEmpList();
    // }, []);

    const cleanObject = (obj) => {
        // Return new object excluding keys with null or undefined values
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
        );
    };

    {
        tableData.length > 0 && (
            <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f3f3f3', borderRadius: 8 }}>
                {/* <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4a148c' }}>Current Total:</Text> */}
                <Text style={{ fontSize: 15, color: '#000' }}>Gross Amount: ₹{totalGross.toFixed(2)}</Text>
                <Text style={{ fontSize: 15, color: '#000' }}>GST Amount: ₹{totalGST.toFixed(2)}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#000' }}>Grand Total: ₹{totalGrand.toFixed(2)}</Text>
            </View>
        )
    }
    const submitData = async () => {
        console.log('Submitting data:', tableData);
        if (tableData.length === 0) {
            Alert.alert("No data", "Please add items before submitting.");
            return;
        }

        try {
            setLoading(true);

            // Step 1: Get TRANNO from backend
            const trannoResponse = await api.get('/tranno');
            console.log('TRANNO Response:', trannoResponse.data);
            const TRANNO = trannoResponse.data;
            if (!TRANNO) throw new Error("Failed to get TRANNO");

            // Step 2: Fetch ESTBATCHNO helper function
            const estBatchNo = await fetchEstBatchNo();
            if (!estBatchNo) {
                Alert.alert('Error', 'Could not retrieve ESTBATCHNO');
                return;
            }

            // --- Date helpers ---
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

            // --- Step 3: Enrich items ---
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

                    // Fetch stoneCatCode
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

                    let tagDetails = {};
                    try {
                        const tagDetailsResponse = await api.get(`/tagDetails/${item.TAGNO}`);
                        tagDetails = tagDetailsResponse.data || {};
                    } catch (err) {
                        console.warn(`Failed to fetch tag details`, err);
                    }

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


            const estIssueResponse = await api.post('/estissue', rawItems);

            console.log("📦 Full estIssueResponse.data:", JSON.stringify(estIssueResponse.data, null, 2));



            // Step 2: Validate and extract data
            const savedIssues = Array.isArray(estIssueResponse.data)
                ? estIssueResponse.data
                : (estIssueResponse.data?.data || []);

            console.log("📦 Saved issues received:", savedIssues);

            if (!Array.isArray(savedIssues)) {
                throw new Error("❌ Invalid EstIssue response: expected an array but got " + JSON.stringify(estIssueResponse.data));
            }

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

                // Optional: get tax config
                let taxDetails = {};
                try {
                    const taxRes = await api.get(`/getEstTaxTranDetails/${rawItem.ITEMID}`);
                    taxDetails = taxRes?.data?.[0] || {};
                    console.log(`✅ Tax details for ITEMID=${rawItem.ITEMID}:`, taxDetails);
                } catch (err) {
                    console.warn(`❌ Failed to fetch tax details for ITEMID=${rawItem.ITEMID}`, err);
                }

                // Build base payload (no taxid, tsno here!)
                const basePayload = {
                    sno: estTaxTranSno,
                    isssno: String(estSNO),
                    tranno: Number(TRANNO),
                    trandate: formatDateToMidnightSql(rawItem.TRANDATE),
                    trantype: "SA",
                    batchno: String(estBatchNo),
                    amount: parseFloat(amount.toFixed(2)),
                    taxtype: null, // ✅ Must not be null or ""
                    costid: String(rawItem.COSTID),
                    companyid: String(rawItem.COMPANYID),
                    studded: null // ✅ Must not be null
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


            try {
                await api.post('/updateTranno');
            } catch (err) {
                Alert.alert("Partial Success", "Data submitted, but TRANNO update failed.");
            }

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

            // Save est_batch_no to state and also return it
            const batchNo = estDetails?.est_batch_no || "";
            setEstBatchNo(batchNo);

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
            setTableData([]);

            return batchNo;   // ✅ instead of true

        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message || "Something went wrong.");
            console.error("Submitting error:", error);
            return false;  // 👈 ensure false on error
        } finally {
            setLoading(false);
        }
    };





    // <TextInput
    //     style={[styles.inlineInput, { minWidth: 200 }]}
    //     placeholder="Search Employee"
    //     value={emp}
    //     onChangeText={(text) => {
    //         setEmp(text);
    //         const filtered = empList.filter(empItem =>
    //             empItem.EMPNAME.toLowerCase().includes(text.toLowerCase()) ||
    //             empItem.EMPID.toString().includes(text)
    //         );
    //         setFilteredEmpList(filtered);
    //         setShowEmpList(true);
    //     }}
    // />

    // {
    //     showEmpList && (
    //         <View style={styles.dropdown}>
    //             <FlatList
    //                 data={filteredEmpList}
    //                 keyExtractor={(item) => item.EMPID.toString()}
    //                 renderItem={({ item }) => (
    //                     <TouchableOpacity
    //                         onPress={() => {
    //                             setEmp(item.EMPNAME);
    //                             setSelectedEmpID(item.EMPID);
    //                             setShowEmpList(false);
    //                         }}
    //                     >
    //                         <Text style={styles.dropdownItem}>{item.EMPNAME}</Text>
    //                     </TouchableOpacity>
    //                 )}
    //             />
    //         </View>
    //     )
    // }


        return (
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                {/* 📊 Estimation Card */}
                <EstimationScreen />

                {/* {tableData.length > 0 && (
                    <View style={styles.totalsCard}>
                        <Text style={styles.totalsTitle}>Current Totals</Text>

                        <Text style={styles.labelText}>
                            Gross Total: <Text style={styles.amountText}>₹{totalGross.toFixed(2)}</Text>
                        </Text>

                        <Text style={styles.labelText}>
                            GST Total: <Text style={styles.amountText}>₹{totalGST.toFixed(2)}</Text>
                        </Text>

                        <Text style={[styles.labelText, { fontWeight: '600' }]}>
                            Grand Total: <Text style={styles.amountText}>₹{totalGrand.toFixed(2)}</Text>
                        </Text>
                    </View>
                )} */}

                {
                    tableData.length > 0 && (
                        <View
                            style={{
                                
                                backgroundColor: '#f3f3f3',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10   // 👈 space after totals box
                            }}
                        >
                            {/* <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4a148c', marginBottom: 8 }}>
                                Current Total:
                            </Text> */}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                {/* Gross Amount */}
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, color: '#555' }}>Gross Amount</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#000' }}>
                                        ₹{totalGross.toFixed(2)}
                                    </Text>
                                </View>

                                {/* GST Amount */}
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, color: '#555' }}>GST Amount</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#000' }}>
                                        ₹{totalGST.toFixed(2)}
                                    </Text>
                                </View>

                                {/* Grand Total */}
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, color: '#555' }}>Grand Total</Text>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>
                                        ₹{totalGrand.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )
                }




                {/* 📥 Input Fields */}
                <View style={styles.inputRow}>
                    {/* Item ID */}
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={itemIdInputRef}
                            style={styles.input}
                            placeholder="Item ID"
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
                        >
                            <Text style={styles.scanIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tag No */}
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={tagInputRef}
                            style={styles.input}
                            placeholder="Tag No"
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
                        >
                            <Text style={styles.scanIcon}>📷</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Emp ID */}
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={empInputRef}
                            style={styles.input}
                            placeholder="Emp ID"
                            value={emp}
                            onChangeText={setEmp}
                            onSubmitEditing={fetchData}
                            returnKeyType="done"
                        />
                    </View>
                </View>


                {/* 🔽 Dropdown (Item Suggestions) */}
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
                                >
                                    <Text style={styles.dropdownItem}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* ⏳ Loader */}
                {loading && <ActivityIndicator size="large" color="#7b1fa2" style={{ marginVertical: 20 }} />}

                

                {tableData.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            {/* Header Row */}
                            <View style={styles.headerRow}>
                                {[
                                    'Item ID', 'Tag No', 'Pcs', 'Grswt', 'NetWt', 'Rate', 'Wastage',
                                    'MC', 'Stone', 'Misc', 'Gross', 'GST', 'GrandTotal', 'Emp'
                                ].map((label, idx) => (
                                    <Text key={idx} style={styles.headerCell}>{label}</Text>
                                ))}
                            </View>

                            {/* Data Rows */}
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


                {/* 🔢 Transaction Number */}
                {tranno && (
                    <Text style={styles.trannoText}>
                        Last Submitted TRANNO: {tranno}
                    </Text>
                )}

                {/* 🔍 Scanner Modal */}
                <BarcodeScannerModal
                    visible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    scanningField={scanningField}
                    onScanned={handleScanned}
                />

                {/* <TouchableOpacity style={styles.submitButton} onPress={submitData}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.printButton} onPress={() => PrintSlip(estBatchNo, username)}>
                    <Text style={styles.printButtonText}>Print</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={async () => {
                        const batchNo = await submitData();  // returns batchNo
                        if (!batchNo) {
                            Alert.alert("Estimation No not found", "Cannot print slip");
                            return;
                        }
                        setEstBatchNo(batchNo); // save to state
                        console.log('ESTBATCHNO:', batchNo);
                        try {
                            await PrintSlip(batchNo, username);
                        } catch (err) {
                            console.error("Print error:", err);
                            Alert.alert("Print Failed", "Unable to generate slip");
                        }
                    }}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>

                {/* New Print Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: "#7b1fa2" }]}
                    onPress={async () => {
                        if (!estBatchNo) {
                            Alert.alert("No slip available", "Please submit first to generate a slip");
                            return;
                        }

                        try {
                            await PrintSlip(estBatchNo, username);
                        } catch (err) {
                            console.error("Print error:", err);
                            Alert.alert("Print Failed", "Unable to generate slip");
                        }
                    }}
                >
                    <Text style={styles.submitButtonText}>Print</Text>
                </TouchableOpacity>




            </ScrollView>
        );
    };


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3e5f5',
        padding: 16,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ba68c8',
        borderRadius: 6,
        backgroundColor: '#f8eafa',
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        color: '#4a148c',
    },
    scanIcon: {
        fontSize: 15,
        paddingLeft: 6,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#ba68c8',
        borderWidth: 1,
        borderRadius: 6,
        maxHeight: 140,
        marginTop: 2,
        marginBottom: 10,
        zIndex: 10,
        elevation: 5,
    },
    dropdownItem: {
        padding: 10,
        borderBottomColor: '#e1bee7',
        borderBottomWidth: 1,
        color: '#4a148c',
    },
    totalsCard: {        // renamed from totalsContainer
        marginVertical: 16,
        padding: 12,
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4a148c',
        marginBottom: 6,
    },
    totalText: {
        fontSize: 10,
        color: '#000',
    },
    grandTotal: {
        fontWeight: '600',
    },
    verticalTable: {
        marginTop: 12,
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
        padding: 8,
    },
    verticalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    fieldTitle: {
        width: 100,
        fontWeight: 'bold',
        fontSize: 13,
        color: '#4a148c',
    },
    fieldValue: {
        minWidth: 70,
        marginHorizontal: 6,
        fontSize: 13,
        textAlign: 'center',
        color: '#000',
        backgroundColor: '#fff',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#e1bee7',
    },
    trannoText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4a148c',
        marginTop: 12,
    },
    submitButton: {
        backgroundColor: '#7b1fa2',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    printButton: {
        backgroundColor: '#4a148c',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    printButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },

    labelText: {
        fontSize: 12,
        color: '#4a148c',  // Purple color for text labels
    },
    amountText: {
        color: '#000',     // Black color for amounts
    },
    horizontalTable: {
        flexDirection: 'row',
        padding: 10,
    },
    tablePart: {
        marginRight: 20,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#6a1b9a',
        paddingVertical: 6,
    },
    headerCell: {
        color: '#fff',
        fontWeight: 'bold',
        paddingHorizontal: 10,
        minWidth: 80,
        textAlign: 'center',
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 6,
    },
    cell: {
        minWidth: 80,
        textAlign: 'center',
        paddingHorizontal: 10,
        color: '#4a148c',
        fontSize: 12,
    },
});






export default HomeScreen;
