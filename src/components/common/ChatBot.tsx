import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { selectCartItems } from '../../store/slices/cartSlice';
import { selectAllOrders } from '../../store/slices/ordersSlice';
import { selectAllProducts } from '../../store/slices/productsSlice';
import { useCurrency } from '../../utils/currencyUtils';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  action?: {
    label: string;
    screen: string;
    subScreen?: string;
  };
}

export const ChatBot = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { setActiveTab } = useContext(WebNavigationContext) as any;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const cartItems = useSelector(selectCartItems);
  const orders = useSelector(selectAllOrders);
  const products = useSelector(selectAllProducts);
  const { formatPrice, selectedCurrency } = useCurrency();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text:
          t('chatBot.greeting', { name: user?.name || 'Shopper' }) ||
          `Hello ${user?.name || 'Shopper'
          }! How can I help you with your shopping today?`,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, [t, user?.name]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        action: response.action,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (
    text: string,
  ): {
    text: string;
    action?: { label: string; screen: string; subScreen?: string };
  } => {
    const input = text.toLowerCase();

    if (input.includes('order') || input.includes('commande')) {
      if (orders.length > 0) {
        const lastOrder = orders[0];
        return {
          text: `You have ${orders.length} orders. Your latest order #${lastOrder.id.slice(0, 8)}... is currently ${lastOrder.status}. Total: ${formatPrice(lastOrder.totalAmount, lastOrder.currency)}.`,
          action: { label: 'View All Orders', screen: 'OrdersTab' },
        };
      }
      return {
        text: "You haven't placed any orders yet. Would you like to browse the catalog?",
        action: { label: 'Go to Shop', screen: 'Catalog' },
      };
    }

    if (input.includes('cart') || input.includes('panier') || input.includes('basket')) {
      if (cartItems.length > 0) {
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        return {
          text: `You have ${totalItems} items in your cart. Ready to checkout?`,
          action: { label: 'Go to Cart', screen: 'CartTab' },
        };
      }
      return {
        text: 'Your cart is currently empty. Need some inspiration?',
        action: { label: 'Browse Products', screen: 'Catalog' },
      };
    }

    if (input.includes('catalog') || input.includes('product') || input.includes('shop') || input.includes('browse')) {
      const budget = input.match(/\d+/);
      if (budget) {
        const maxPrice = parseInt(budget[0]);
        const cheapProducts = products.filter(p => p.price <= maxPrice).slice(0, 3);
        if (cheapProducts.length > 0) {
          return {
            text: `I found ${cheapProducts.length} products under ${formatPrice(maxPrice)}. For example: ${cheapProducts.map(p => p.name).join(', ')}.`,
            action: { label: 'See More', screen: 'Catalog' },
          }
        }
      }
      return {
        text: 'Explore our curated collections! We have amazing items waiting for you.',
        action: { label: 'Open Shop', screen: 'Catalog' },
      };
    }

    if (input.includes('promo') || input.includes('sale') || input.includes('discount')) {
      return {
        text: '🎉 Exclusive for you: Use code PREMIUM25 for 25% off! Explore our clearance section for up to 70% off.',
        action: { label: 'Shop Sales', screen: 'Catalog', subScreen: 'sale' },
      };
    }

    if (input.includes('currency') || input.includes('devise') || input.includes('rate') || input.includes('convert')) {
      return {
        text: `You are currently using ${selectedCurrency}. You can switch currencies instantly in settings to see prices in your local money!`,
        action: { label: 'Change Currency', screen: 'Settings', subScreen: 'Currencies' },
      };
    }

    if (input.includes('help') || input.includes('aidet') || input.includes('question')) {
      return {
        text: "I'm your Pro Assistant! I can track orders, find cheap products, convert currencies, or give you discount codes. Just ask!",
      }
    }

    return {
      text: t('chatBot.placeholder') || "I'm ShopyShop's Pro AI Assistant. How can I make your shopping experience better today?",
    };
  };

  const handleAction = (action: {
    label: string;
    screen: string;
    subScreen?: string;
  }) => {
    if (Platform.OS === 'web') {
      setActiveTab(action.screen, action.subScreen);
    } else {
      navigation.navigate(action.screen, { screen: action.subScreen });
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageWrapper,
        item.sender === 'user' ? styles.userWrapper : styles.botWrapper,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.sender === 'user'
            ? { backgroundColor: theme.colors.primary }
            : {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.sender === 'user' ? '#FFF' : theme.colors.text },
          ]}
        >
          {item.text}
        </Text>
        {item.action && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={() => handleAction(item.action!)}
          >
            <Text style={styles.actionButtonText}>{item.action.label} →</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.timestamp, { color: theme.colors.subText }]}>
        {item.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.headerTitle}>ShopyShop Assistant</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {isTyping && (
          <Text style={styles.typingIndicator}>Assistant is typing...</Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.colors.subText}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSend}
          >
            <Text style={styles.sendIcon}>🏹</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    headerStatus: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
    listContent: { padding: 20, paddingBottom: 40 },
    messageWrapper: { marginBottom: 24, maxWidth: '85%' },
    userWrapper: { alignSelf: 'flex-end' },
    botWrapper: { alignSelf: 'flex-start' },
    bubble: {
      padding: 16,
      borderRadius: 24,
      ...theme.shadows.small,
    },
    messageText: { fontSize: 15, lineHeight: 22 },
    timestamp: { fontSize: 10, marginTop: 4, marginHorizontal: 8 },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 12,
      fontSize: 16,
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendIcon: { fontSize: 22, color: '#FFF' },
    actionButton: {
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    actionButtonText: { color: '#000', fontWeight: '600', fontSize: 14 },
    typingIndicator: {
      padding: 10,
      fontStyle: 'italic',
      color: theme.colors.subText,
    },
  });
