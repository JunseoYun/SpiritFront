import React, { useState, useRef, useEffect } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    Pressable,
    StyleSheet,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    Modal
} from 'react-native';

const { width } = Dimensions.get('window');
const stores = [
  { name: '상점 1' },
  { name: '상점 2' },
  { name: '상점 3' },
  { name: '상점 4' },
  { name: '상점 5' },
  { name: '상점 6' },
  { name: '상점 7' },
  { name: '상점 8' },
  { name: '상점 9' },
  { name: '상점 10' },
];

const RandomChoiceScreen = ({ navigation }) => {
    const [selectedStore, setSelectedStore] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const explosionAnimation = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const previousEndValue = useRef(0);

    const pickRandomStore = () => {
        if (stores && stores.length > 0) {
            const randomIndex = Math.floor(Math.random() * stores.length);
            const targetValue = previousEndValue.current + stores.length * 2 + randomIndex;

            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: previousEndValue.current + stores.length * 2, // Scroll through the list multiple times
                    duration: 4000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: targetValue, // Stop at the chosen store
                    duration: 2000,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false,
                }),
            ]).start(() => {
                const finalIndex = Math.floor(targetValue % stores.length);
                setSelectedStore(stores[finalIndex]);
                setModalVisible(true);
                previousEndValue.current = targetValue;

                // Trigger explosion animation
                explosionAnimation.setValue(0);
                Animated.timing(explosionAnimation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }).start();
            });
        } else {
            setSelectedStore(null);
        }
    };

    useEffect(() => {
        const listener = animatedValue.addListener(({ value }) => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: (value % stores.length) * width, animated: false });
            }
        });
        return () => animatedValue.removeListener(listener);
    }, [stores]);

    const explosionStyle = {
        transform: [
            { scale: explosionAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) },
        ],
        opacity: explosionAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.7, 0] }),
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>랜덤 선택 게임</Text>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                scrollEnabled={false} // Disable manual scrolling
            >
                {[...stores, ...stores].map((store, index) => (
                    <View key={index} style={[styles.storeContainer, { width }]}> 
                        <Text style={styles.storeName}>{store.name}</Text>
                    </View>
                ))}
            </ScrollView>

            <Pressable style={styles.button} onPress={pickRandomStore}>
                <Text style={styles.buttonText}>랜덤 선택</Text>
            </Pressable>

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.explosion, explosionStyle]} />
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>여기 당첨!</Text>
                        {selectedStore && <Text style={styles.modalStoreName}>{selectedStore.name}</Text>}
                        <Pressable
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>확인</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    scrollView: {
        flexGrow: 0,
    },
    storeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    storeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007bff',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalStoreName: {
        fontSize: 20,
        color: '#007bff',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    explosion: {
        position: 'absolute',
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 200, 0, 0.5)',
        borderRadius: 50,
    },
});

export default RandomChoiceScreen;
