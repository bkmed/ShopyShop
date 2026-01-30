import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllMessages,
  sendMessage,
} from '../../store/slices/messagesSlice';
import { Theme } from '../../theme';
import { ChatMessage } from '../../database/schema';

export const CompanyChatScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const messages = useSelector(selectAllMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: String(user.id),
      receiverId: 'support',
      createdAt: new Date().toISOString(),
    };

    dispatch(sendMessage(newMessage));
    setInputText('');
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = String(user?.id) === item.senderId;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.bubbleContainer,
            isMe ? styles.myBubbleContainer : styles.otherBubbleContainer,
          ]}
        >
          {!isMe && <Text style={styles.senderName}>Support</Text>}
          <View
            style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
          >
            <Text
              style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.text}
            </Text>
          </View>
          <Text
            style={[
              styles.timestamp,
              isMe ? styles.myTimestamp : styles.otherTimestamp,
            ]}
          >
            {formatTime(item.createdAt || '')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('chat.title') || 'Shop Chat'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={{ color: theme.colors.subText }}>
              {t('chat.noMessages') || 'No messages yet. Say hi to support!'}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainerWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat.typeMessage') || 'Type a message...'}
            placeholderTextColor={theme.colors.subText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    listContent: { padding: 16 },
    messageRow: { flexDirection: 'row', marginBottom: 16 },
    myMessageRow: { justifyContent: 'flex-end' },
    otherMessageRow: { justifyContent: 'flex-start' },
    bubbleContainer: { maxWidth: '80%' },
    myBubbleContainer: { alignItems: 'flex-end' },
    otherBubbleContainer: { alignItems: 'flex-start' },
    senderName: {
      fontSize: 12,
      color: theme.colors.subText,
      marginBottom: 4,
      marginLeft: 4,
    },
    bubble: { padding: 12, borderRadius: 16, minWidth: 40 },
    myBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageText: { fontSize: 16, lineHeight: 22 },
    myMessageText: { color: '#FFF' },
    otherMessageText: { color: theme.colors.text },
    timestamp: { fontSize: 10, color: theme.colors.subText, marginTop: 4 },
    myTimestamp: { marginRight: 4 },
    otherTimestamp: { marginLeft: 4 },
    inputContainerWrapper: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 100,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sendButton: {
      marginLeft: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendIcon: { color: '#FFF', fontSize: 18, marginLeft: 2 },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  });
