import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { UserContext } from '../screens/UserContext';

const EstimationScreen = () => {
    const BASE_URL = 'https://est.brightechsoftware.com/api/v1';
    const [goldRate, setGoldRate] = useState(null);
    const [silverRate, setSilverRate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [rateUpdated, setRateUpdated] = useState(null);
    const { username } = useContext(UserContext);

    const formatDate = (date) => date.toLocaleDateString('en-GB');

    const fetchRates = async () => {
        setLoading(true);
        setError(false);

        try {
            const response = await fetch(`${BASE_URL}/todayrate`);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            if (data?.GOLDRATE && data?.SILVERRATE) {
                setGoldRate(data.GOLDRATE);
                setSilverRate(data.SILVERRATE);
                setRateUpdated(new Date().toLocaleTimeString('en-GB'));
            } else {
                throw new Error('Invalid data');
            }
        } catch (err) {
            console.error('Error fetching rates:', err.message);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 60000);
        return () => clearInterval(interval);
    }, []);

    const currentDate = new Date();

    return (
        <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
            {/* Row 1: Bill Date | Gold Rate */}
            <View style={styles.row}>
                <Text style={styles.label}>
                    📅 Bill Date: <Text style={styles.value}>{formatDate(currentDate)}</Text>
                </Text>
                <Text style={styles.label}>
                    🏅 Gold Rate: <Text style={styles.value}>₹ {loading ? 'Loading...' : error ? 'Error' : goldRate}</Text>
                </Text>
            </View>

            {/* Row 2: User Name | Silver Rate */}
            <View style={styles.row}>
                <Text style={styles.label}>
                    👤 User Name: <Text style={styles.value}>{username || 'N/A'}</Text>
                </Text>
                <Text style={styles.label}>
                    🥈 Silver Rate: <Text style={styles.value}>₹ {loading ? 'Loading...' : error ? 'Error' : silverRate}</Text>
                </Text>
            </View>

            {rateUpdated && (
                <Text style={styles.updatedText}>🕒 Last updated: {rateUpdated}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <Text style={styles.buttonText}>🛒 Sales</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.refreshButton]} onPress={fetchRates}>
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>🔄 Refresh</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: {
        
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,   // reduced from 16
        paddingVertical: 4,      // reduced from 8
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    label: {
        fontSize: 13,            // slightly smaller
        color: '#7b1fa2',
        fontWeight: '600',
    },
    value: {
        fontSize: 13,            // match label
        color: '#4a148c',
        fontWeight: '500',
    },
    updatedText: {
        marginTop: 6,            // reduced from 8
        fontSize: 11,            // slightly smaller
        color: '#757575',
        textAlign: 'right',
        paddingHorizontal: 10,   // reduced from 16
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,                 // reduced from 16
        flexWrap: 'wrap',
        marginVertical: 12,      // reduced from 20
    },
    button: {
        backgroundColor: '#6a1b9a',
        paddingVertical: 6,      // reduced from 8
        paddingHorizontal: 10,   // reduced from 13
        borderRadius: 6,         // slightly smaller radius
        minWidth: 100,           // reduced from 120
        alignItems: 'center',
        marginHorizontal: 6,     // reduced from 8
    },
    refreshButton: {
        backgroundColor: '#8e24aa',
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,            // reduced from 14
        fontWeight: '600',
    },
});


export default EstimationScreen;
