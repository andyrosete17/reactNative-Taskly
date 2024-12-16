import { View, TouchableOpacity, StyleSheet, Text, Alert, Pressable } from 'react-native';
import { theme } from '../theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  name: string;
  isCompleted?: boolean;
  completedAtTimestamp?: number;
  onDelete: () => void;
  toggleComplete: () => void;
};
export function ShoppingListItem({ name, isCompleted, onDelete, toggleComplete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete', `Are you sure you want to delete ${name}?`, [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onDelete
      }
    ]);
  };

  return (
    <Pressable
      onPress={toggleComplete}
      style={[styles.itemContainer, isCompleted ? styles.completedContainer : undefined]}
    >
      <View style={styles.rowContainer}>
        <Feather
          name={isCompleted ? 'check-circle' : 'circle'}
          size={24}
          color={isCompleted ? theme.colorGrey : theme.colorCerulian}
        />

        <Text
          style={[styles.itemText, isCompleted ? styles.completedText : undefined]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={!isCompleted ? handleDelete : undefined}
        activeOpacity={!isCompleted ? 0.7 : 1}
      >
        <AntDesign
          name="closecircle"
          size={24}
          color={isCompleted ? theme.colorGrey : theme.colorRed}
        />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomColor: theme.colorCerulian,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  completedContainer: {
    backgroundColor: theme.colorLightGrey,
    borderBottomColor: theme.colorLightGrey
  },
  itemText: { fontSize: 18, fontWeight: '200', flex: 1 },
  completedText: {
    textDecorationLine: 'line-through',
    textDecorationColor: theme.colorGrey
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1
  }
});
