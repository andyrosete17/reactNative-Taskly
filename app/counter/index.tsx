import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { theme } from '../../theme';
import { registerForPushNotificationsAsync } from '../../utils/registerForPushNotifiicationsAsync';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { intervalToDuration, isBefore } from 'date-fns';
import { TimeSegment } from '../../components/TimeSegment';
import { getFromStorage, saveToStorage } from '../../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
// 2weeks seconds from now
const frequency = 14 * 24 * 60 * 60 * 1000;

export const countDownStorageKey = 'taskly-countdown';

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedTimestamp: number[];
};

type CountdownStatus = {
  isOverdue: boolean;
  distance: ReturnType<typeof intervalToDuration>;
};
export default function CounterScreen() {
  const confettiRef = useRef<any>();
  const { width } = useWindowDimensions();
  const [countDownState, setCountDownState] = useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countDownStorageKey);
      setCountDownState(value);
    };
    init();
  }, []);

  const lastCompletedTimestamp = countDownState?.completedTimestamp[0];

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();
      if (lastCompletedTimestamp) {
        setIsLoading(false);
      }
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : { start: Date.now(), end: timestamp }
      );
      setStatus({ isOverdue, distance });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [lastCompletedTimestamp]);

  const scheduleNotification = async () => {
    confettiRef.current.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId;

    const result = await registerForPushNotificationsAsync();
    if (result === 'granted') {
      console.log('Permission granted');
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to wash the car! 🚗',
          body: 'Mark it as done if you have completed it.',
          badge: 1
        },
        trigger: {
          seconds: frequency / 1000,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
        }
      });
    } else if (Device.isDevice) {
      Alert.alert(
        'Unable to schedule notifications',
        'Enable the notification permission for Expo Go in settings'
      );
    }
    if (countDownState?.currentNotificationId) {
      console.log('cancelamos');
      await Notifications.cancelScheduledNotificationAsync(
        countDownState.currentNotificationId
      );
    }
    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedTimestamp: countDownState
        ? [Date.now(), ...countDownState.completedTimestamp]
        : [Date.now()]
    };
    console.log('New countdown state:', newCountdownState);
    setCountDownState(newCountdownState);
    await saveToStorage(countDownStorageKey, newCountdownState);
    console.log('Permission result:', result);
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.activityIndicator} />;
  }

  return (
    <View style={[styles.container, status.isOverdue ? styles.containerLate : undefined]}>
      {status.isOverdue ? (
        <Text style={[styles.heading, status.isOverdue ? styles.whiteText : undefined]}>
          Car washed overdue by
        </Text>
      ) : (
        <Text style={styles.heading}> Car washed due in...</Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          unit="Days"
          number={status.distance.days || 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Hours"
          number={status.distance.hours || 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Minutes"
          number={status.distance.minutes || 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Seconds"
          number={status.distance.seconds || 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>I've washed the car!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  containerLate: {
    backgroundColor: theme.colorRed
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6
  },
  buttonText: {
    letterSpacing: 1,
    color: theme.colorWhite,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24
  },
  whiteText: {
    color: theme.colorWhite
  },
  activityIndicator: {
    backgroundColor: theme.colorWhite,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }
});
