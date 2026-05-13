export interface SpecialEvent {
  id: string;
  name: string;
  isPreset: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Show {
  id: string;
  name: string;
  venue?: string;
  startDate: string;
  endDate: string;
  color: string; // hex, one of 6 presets
  headerImageUrl?: string; // base64 data URL
  seatGrades: SeatGrade[];
  discountTypes: DiscountType[];
  stampBoards: StampBoard[];
  events: StampEvent[];
  specialEvents: SpecialEvent[];
  isArchived: boolean;
  createdAt: string;
  tabOrder?: number; // 낮을수록 탭바 앞에 표시 (기본값: 생성 순서)
  isCancelled?: boolean;
  cancelledAt?: string;
  archivePromptDismissed?: boolean;
}

export interface SeatGrade {
  id: string;
  name: string;
  price: number;
}

export interface DiscountType {
  id: string;
  name: string;
  method: 'rate' | 'amount' | 'direct';
  value: number;
  isRebook: boolean;
  isCoupon: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface StampBoard {
  id: string;
  showId: string;
  name: string;
  capacity: number;
  initialStamps: number;
  stamps: Stamp[];
  benefits: Benefit[];
  isActive: boolean;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
  stampColor?: string; // 도장 색상 (hex, 기본 #0d9488)
  isHidden?: boolean;  // 소프트 딜리트 플래그 (확정 도장 있는 판)
  hiddenAt?: string;
}

export type StampType = 'visit' | 'initial' | 'exchange' | 'share' | 'etc';

export interface Stamp {
  id: string;
  scheduleId: string | null;
  isInitial: boolean;
  isConfirmed: boolean;
  earnedAt: string;
  stampType?: StampType;  // 미설정 시 isInitial ? 'initial' : 'visit'
  memo?: string;
}

export interface Benefit {
  id: string;
  requiredStamps: number;
  description: string;
  priority: number;
  isAchieved: boolean;
  isUsed: boolean;
  usedAt?: string;
  attachmentUrl?: string;
  couponCode?: string;
  usageNote?: string;  // 혜택 사용 방법 메모
}

export interface Schedule {
  id: string;
  showId: string;
  date: string;
  time?: string;
  seatGradeId: string | null;
  discountTypeId: string | null;
  finalPrice: number;
  originalPrice: number;
  multiplier: number;
  boardAllocations: BoardAllocation[];
  isConfirmed: boolean;
  memo?: string;
  note?: string;
  rating?: number;
  createdAt: string;
  status?: 'draft' | 'confirmed' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
  confirmedAt?: string;
  cast?: string;
  specialEventIds: string[];  // 기본값 []
  refundAmount?: number;
  priceDiffNote?: string;  // 차액 미반영 시 자동 생성 메모
  isShare?: boolean;  // 나눔 관극 여부
}

export interface BoardAllocation {
  boardId: string;
  stamps: number;
}

export interface StampEvent {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  multiplier: number;
  targetScheduleId?: string;
}

export interface AppSettings {
  showRealCost: boolean;
  onboardingDone: boolean;
  hasCompletedQuickStart?: boolean;
  hasSeenConfirmTip?: boolean;
  lastUsedShowId?: string;
  lastUsedSeatGradeId?: string;
  lastUsedDiscountTypeId?: string;
}

export interface UndoAction {
  type: 'DELETE_SCHEDULE' | 'CANCEL_SCHEDULE' | 'DELETE_BOARD' | 'CHANGE_TICKET';
  payload: unknown;
  expiresAt: number;
  message: string;
}

export interface SimulatorBoardResult {
  boardId: string;
  boardName: string;
  stampsAdded: number;
  achievedBenefits: {
    description: string;
    requiredStamps: number;
  }[];
}

export interface SimulatorResult {
  totalBenefits: number;
  boardResults: SimulatorBoardResult[];
}
