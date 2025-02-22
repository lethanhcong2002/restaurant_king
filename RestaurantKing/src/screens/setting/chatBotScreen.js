/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const MessageItem = ({ item, formatTime }) => (
    <View className={`m-2 p-2 rounded-lg max-w-[90%] ${item.user._id === 1 ? 'bg-[#DCF8C6] self-end' : 'bg-[#F1F0F0] self-start'}`}>
        <View className="flex-col items-start">
            <Text className="text-sm font-bold mb-1">{item.user.name}</Text>
            <Text className="text-xs text-[#333]">{item.text}</Text>
            <Text className=" text-[#888] mt-1" style={{fontSize: 10}}>{formatTime(item.createdAt)}</Text>
        </View>
    </View>
);

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const ChatBotScreen = ({navigation}) => {
    const user = useSelector(state => state.auth.userData);
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(user.uid || '');
    const [serverStatus, setServerStatus] = useState(null);
    const [userMessage, setUserMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [typingDots, setTypingDots] = useState('');

    const flatListRef = useRef(null);

    const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true });
    useEffect(() => {
        const checkServerConnection = async () => {
            try {
                const response = await fetch('http://10.0.7.207:3000');
                console.log(response.ok ? 'Server is reachable' : 'Server is unreachable');
            } catch {
                console.log('Server is unreachable');
            }
        };

        checkServerConnection();
        setMessages([{ _id: 1, text: 'Xin chào, tôi có thể giúp gì cho bạn?', createdAt: Date.now(), user: { _id: 2, name: 'RK' } }]);
    }, []);

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (loading) {
            const intervalId = setInterval(() => setTypingDots((prev) => (prev.length < 3 ? prev + '.' : '')), 500);
            return () => clearInterval(intervalId);
        }
    }, [loading]);

    const onSend = useCallback(async () => {
        if (userMessage.trim() === '') {return;}

        setMessages((prevMessages) => [
            ...prevMessages,
            { _id: Math.random(), text: userMessage, createdAt: Date.now(), user: { _id: 1, name: user.customerName } },
        ]);

        setLoading(true);

        setMessages((prevMessages) => [
            ...prevMessages,
            { _id: 'typing', text: `${typingDots}`, createdAt: Date.now(), user: { _id: 2, name: 'RK' } },
        ]);

        try {
            const response = await fetch('http://10.0.7.207:3000/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, sessionId }),
            });

            const data = await response.json();
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== 'typing').concat({
                _id: Math.random(),
                text: data.reply,
                createdAt: Date.now(),
                user: { _id: 2, name: 'RK' },
            }));
            setUserMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    }, [userMessage, sessionId, typingDots]);

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white">
                <Appbar.Header className="bg-white border-b border-gray-200">
                    <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Trò chuyện cùng RK" titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }} />
                </Appbar.Header>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => <MessageItem item={item} formatTime={formatTime} />}
                    keyExtractor={(item) => item._id.toString()}
                    onContentSizeChange={scrollToBottom}
                />

                <View className="flex-row p-2 border-t border-[#e1e1e1] bg-white items-center">
                    <TextInput
                        style={styles.input}
                        value={userMessage}
                        onChangeText={setUserMessage}
                        placeholder="Nhập vào đây"
                        mode="outlined"
                        outlineColor="#4CAF50"
                        placeholderTextColor="#999"
                        theme={{ colors: { text: '#333', primary: '#4CAF50' } }}
                    />
                    <Button onPress={onSend} mode="contained" buttonColor="#4CAF50">
                        Gửi
                    </Button>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = {
    input: {
        flex: 1,
        height: 40,
        marginRight: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        fontSize: 12,
    },
};

export default ChatBotScreen;
