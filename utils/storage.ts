import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getFromStorage(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting data from storage:', error);
  }
}

export async function saveToStorage(key: string, value: object) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving data to storage:', error);
  }
}
