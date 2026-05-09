import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Colors';

const MOCK_ROUTINES = [
  { id: '1', title: 'Morning Exercise', time: '07:00 AM', completed: true, category: 'Health' },
  { id: '2', title: 'Deep Work Session', time: '09:00 AM', completed: false, category: 'Work' },
  { id: '3', title: 'Read 10 Pages', time: '08:00 PM', completed: false, category: 'Personal' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Dheeraj Singh</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profilePlaceholder} />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.statsCard}>
            <View style={styles.statItem}>
              <Flame size={24} color={Colors.white} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle2 size={24} color={Colors.white} />
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Today's Routines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Routines</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_ROUTINES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.routineCard}>
            <View style={[styles.categoryIndicator, { backgroundColor: item.completed ? Colors.success : Colors.primary }]} />
            <View style={styles.routineInfo}>
              <Text style={styles.routineTitle}>{item.title}</Text>
              <View style={styles.timeContainer}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.routineTime}>{item.time}</Text>
              </View>
            </View>
            <View style={styles.statusIcon}>
              {item.completed ? (
                <CheckCircle2 size={24} color={Colors.success} />
              ) : (
                <Circle size={24} color={Colors.border} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Action Area */}
        <View style={styles.quickActionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionLabel}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionEmoji}>🏃</Text>
              <Text style={styles.actionLabel}>New Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profilePlaceholder: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  routineCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routineTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusIcon: {
    marginLeft: Spacing.md,
  },
  quickActionContainer: {
    marginTop: Spacing.xl,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});
