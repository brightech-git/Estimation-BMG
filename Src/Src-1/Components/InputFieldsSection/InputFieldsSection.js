import React, { useState, useRef } from 'react';
import {
    View, TextInput, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import BarcodeScannerModal from '../BarCodeScanner/BarcodeScannerModal';

const InputFieldsSection = ({
    ITEMID,
    setITEMID,
    TAGNO,
    setTAGNO,
    emp,
    setEmp,
    itemList,
    setItemList,
    showList,
    setShowList,
    fetchItemList,
    fetchData,
    loading
}) => {
    const [scanningField, setScanningField] = useState(null);
    const [scannerVisible, setScannerVisible] = useState(false);
    
    const itemIdInputRef = useRef(null);
    const tagInputRef = useRef(null);
    const empInputRef = useRef(null);

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

    return (
        <View style={styles.container}>
            {/* 📥 Input Fields */}
            <View style={styles.inputRow}>
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

            {/* 🔍 Scanner Modal */}
            <BarcodeScannerModal
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                scanningField={scanningField}
                onScanned={handleScanned}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
});

export default InputFieldsSection;