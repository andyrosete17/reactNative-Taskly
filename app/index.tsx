import {
  FlatList,
  LayoutAnimation,
  StyleSheet,
  TextInput,
  View,
  Text
} from 'react-native';
import { ShoppingListItem } from '../components/ShoppingListItem';
import { theme } from '../theme';
import { useEffect, useState } from 'react';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getFromStorage, saveToStorage } from '../utils/storage';
// import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';

const storageKey = 'shoppingList';

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

const initialList: ShoppingListItemType[] = [];

export default function App() {
  const [value, setValue] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>(initialList);

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShoppingList(data);
      }
    };
    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value) {
      const newShoppingList = [
        ...shoppingList,
        { id: new Date().toTimeString(), name: value, lastUpdatedTimestamp: Date.now() }
      ];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setShoppingList(newShoppingList);
      saveToStorage(storageKey, newShoppingList);
      setValue('');
    }
  };

  const handleDelete = (itemId: string) => {
    const newShoppingList = shoppingList.filter(item => item.id !== itemId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShoppingList(newShoppingList);
    saveToStorage(storageKey, newShoppingList);
  };

  const handleToggleComplete = (itemId: string) => {
    const newShoppingList = shoppingList.map(item => {
      if (item.id === itemId) {
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return {
          ...item,
          lastUpdatedTimestamp: Date.now(),
          completedAtTimestamp: item.completedAtTimestamp ? undefined : Date.now()
        };
      }
      return item;
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(newShoppingList);
    saveToStorage(storageKey, newShoppingList);
  };

  function orderShoppingList(shoppingList: ShoppingListItemType[]) {
    return shoppingList.sort((item1, item2) => {
      if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
        return item2.completedAtTimestamp - item1.completedAtTimestamp;
      }

      if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
        return 1;
      }

      if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
        return -1;
      }

      if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
        return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
      }

      return 0;
    });
  }

  return (
    <FlatList
      style={styles.container}
      data={orderShoppingList(shoppingList)}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          isCompleted={Boolean(item.completedAtTimestamp)}
          onDelete={() => handleDelete(item.id)}
          toggleComplete={() => handleToggleComplete(item.id)}
        />
      )}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      ListHeaderComponent={
        <TextInput
          style={styles.textInput}
          placeholder="E.g Coffee"
          value={value}
          onChangeText={setValue}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    padding: 12
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 50,
    marginBottom: 12,
    fontSize: 18,
    backgroundColor: theme.colorWhite
  },
  listEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18
  }
});
