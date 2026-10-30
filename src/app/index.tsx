import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/design';

export default function Index() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.page,
  },
});
