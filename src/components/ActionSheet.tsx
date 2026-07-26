import { CalendarDays, CheckSquare, ChevronRight, PenLine } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAction: (label: string) => void;
};

export function ActionSheet({ visible, onClose, onAction }: ActionSheetProps) {
  const actions = [
    { label: '添加待办', icon: CheckSquare },
    { label: '记录灵感', icon: PenLine },
    { label: '安排日程', icon: CalendarDays },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.sheetTitle}>快速开始</Text>
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Pressable key={action.label} style={styles.sheetAction} onPress={() => onAction(action.label)}>
                <View style={styles.sheetActionIcon}>
                  <Icon size={22} color={colors.green700} />
                </View>
                <Text style={styles.sheetActionText}>{action.label}</Text>
                <ChevronRight size={18} color={colors.textSoft} />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    backgroundColor: colors.backdrop,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxWidth: 560,
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sheetAction: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
  },
  sheetActionIcon: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  sheetActionText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
});
