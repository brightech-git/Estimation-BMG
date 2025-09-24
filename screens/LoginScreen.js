import React, { useState, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    Image,
    BackHandler,
    ActivityIndicator,
} from 'react-native';
import { UserContext } from '../screens/UserContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
    const BASE_URL = 'https://est.bmgjewellers.com/api/v1';
    const { setUsername: setGlobalUsername, setUserId: setGlobalUserId } = useContext(UserContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const passwordRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Missing Fields', 'Please enter both Username and Password');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/loginData`);
            const user = response.data.find(u => u.USERNAME === username);

            if (user) {
                if (user.PLAIN_PASSWORD === password) {
                    setGlobalUsername(username);
                    setGlobalUserId(user.USERID || user.userId || null);

                    await AsyncStorage.setItem(
                        'user',
                        JSON.stringify({ username, userId: user.USERID || user.userId || null })
                    );

                    navigation.replace('Home');
                } else {
                    Alert.alert('Login Failed', 'Incorrect password');
                }
            } else {
                Alert.alert('Login Failed', 'Invalid Username');
            }
        } catch (error) {
            console.error('Error fetching login data:', error);
            Alert.alert('Error', 'Unable to reach the server');
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        Alert.alert('Exit', 'Are you sure you want to exit?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo */}
                <Image
                    source={require('../assets/images/loginimage1.png')}
                    style={styles.logo}
                />

                {/* Login Form */}
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Please sign in to continue</Text>

                    <View style={styles.inputContainer}>
                        <Icon name="person-outline" size={20} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#aaa"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                        <TextInput
                            ref={passwordRef}
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                        <Text style={styles.exitText}>Exit</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.footer}>Powered by Brightech Software Solution</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFEFF4' },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center', // Centers logo + form vertically
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 200,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4a148c',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    icon: { marginRight: 8 },
    input: { flex: 1, height: 50, fontSize: 14, color: '#333' },
    loginButton: {
        backgroundColor: '#6a1b9a',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    loginText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    exitButton: {
        backgroundColor: '#e53935',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    exitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    footer: { textAlign: 'center', marginTop: 10, color: '#aaa', fontSize: 13 },
});

export default LoginScreen;
