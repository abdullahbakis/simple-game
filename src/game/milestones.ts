export interface MilestoneToast {
  level: number;
  title: string;
  subtitle: string;
}

export const MILESTONE_TOASTS: MilestoneToast[] = [
  { level: 5, title: 'First Steps', subtitle: 'Keep going!' },
  { level: 10, title: 'Rising Star', subtitle: 'You\'re getting good' },
  { level: 15, title: 'Chain Artist', subtitle: 'Nice drawing skills' },
  { level: 20, title: 'Gravity Master', subtitle: 'Defying the pull' },
  { level: 25, title: 'Warp Navigator', subtitle: 'Portal expert' },
  { level: 30, title: 'Storm Chaser', subtitle: 'EMP? No problem' },
  { level: 35, title: 'Anti-Gravity Ace', subtitle: 'What goes up...' },
  { level: 40, title: 'Laser Dancer', subtitle: 'Don\'t touch the red' },
  { level: 45, title: 'Meteor Dodger', subtitle: 'Space survivor' },
  { level: 50, title: 'Tesla Tamer', subtitle: 'Electricity bows to you' },
  { level: 55, title: 'Force Bender', subtitle: 'Repulsors? Please.' },
  { level: 60, title: 'Phase Walker', subtitle: 'Between dimensions' },
  { level: 65, title: 'Iron Will', subtitle: 'Magnetism can\'t stop you' },
  { level: 70, title: 'Orbit Breaker', subtitle: 'Unstoppable force' },
  { level: 75, title: 'Solar Guardian', subtitle: 'Born from starfire' },
  { level: 80, title: 'Time Bender', subtitle: 'Slow-mo is your ally' },
  { level: 85, title: 'Apex Predator', subtitle: 'Top of the chain' },
  { level: 90, title: 'Void Walker', subtitle: 'Into the abyss' },
  { level: 95, title: 'Living Legend', subtitle: 'Almost there...' },
];

export function getMilestoneForLevel(level: number): MilestoneToast | null {
  return MILESTONE_TOASTS.find(m => m.level === level) ?? null;
}
