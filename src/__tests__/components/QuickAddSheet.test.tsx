import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickAddSheet from '../../components/planner/QuickAddSheet';
import type { Show, SeatGrade, DiscountType } from '../../types';

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function makeGrade(overrides: Partial<SeatGrade> = {}): SeatGrade {
  return { id: 'g1', name: 'VIP', price: 110000, ...overrides };
}

function makeDiscount(overrides: Partial<DiscountType> = {}): DiscountType {
  return {
    id: 'd1', name: '학생할인', method: 'rate', value: 30,
    isRebook: false, isCoupon: false,
    ...overrides,
  };
}

function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 'show1',
    name: '오페라의 유령',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    color: '#6366f1',
    seatGrades: [makeGrade()],
    discountTypes: [makeDiscount()],
    stampBoards: [],
    events: [],
    specialEvents: [],
    isArchived: false,
    createdAt: '',
    ...overrides,
  };
}

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  show: makeShow(),
  lastUsedSeatGradeId: 'g1',
  lastUsedDiscountTypeId: 'd1',
  onQuickAdd: vi.fn(),
  onFullAdd: vi.fn(),
};

// ── QuickAddSheet 테스트 ──────────────────────────────────────────────────────

describe('QuickAddSheet', () => {
  test('공연명 표시', () => {
    render(<QuickAddSheet {...baseProps} />);
    expect(screen.getByText('오페라의 유령')).toBeInTheDocument();
  });

  test('lastUsed 있으면 등급·권종·금액 미리 채워짐', () => {
    render(<QuickAddSheet {...baseProps} />);
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('학생할인')).toBeInTheDocument();
    // 110000 * 0.7 = 77000
    expect(screen.getByText(/77,000/)).toBeInTheDocument();
  });

  test('grade/discount가 없으면 경고 메시지 표시 + 이대로 추가 비활성화', () => {
    const emptyShow = makeShow({ seatGrades: [], discountTypes: [] });
    render(
      <QuickAddSheet
        {...baseProps}
        show={emptyShow}
        lastUsedSeatGradeId={undefined}
        lastUsedDiscountTypeId={undefined}
      />
    );
    expect(screen.getByText(/최근 사용 내역이 없어요/)).toBeInTheDocument();
    expect(screen.getByTestId('quick-add-btn')).toBeDisabled();
  });

  test('이대로 추가 → onQuickAdd 호출', () => {
    const onQuickAdd = vi.fn();
    render(<QuickAddSheet {...baseProps} onQuickAdd={onQuickAdd} />);
    fireEvent.click(screen.getByTestId('quick-add-btn'));
    expect(onQuickAdd).toHaveBeenCalledOnce();
    const [, gradeId, discountId, finalPrice, originalPrice] = onQuickAdd.mock.calls[0];
    expect(gradeId).toBe('g1');
    expect(discountId).toBe('d1');
    expect(finalPrice).toBe(77000);
    expect(originalPrice).toBe(110000);
  });

  test('이대로 추가 후 onClose 호출', () => {
    const onClose = vi.fn();
    render(<QuickAddSheet {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('quick-add-btn'));
    expect(onClose).toHaveBeenCalled();
  });

  test('처음부터 입력 → onFullAdd 호출', () => {
    const onFullAdd = vi.fn();
    render(<QuickAddSheet {...baseProps} onFullAdd={onFullAdd} />);
    fireEvent.click(screen.getByText('처음부터 입력'));
    expect(onFullAdd).toHaveBeenCalledOnce();
  });

  test('isOpen=false 이면 컨텐츠 미노출', () => {
    render(<QuickAddSheet {...baseProps} isOpen={false} />);
    expect(screen.queryByTestId('quick-add-btn')).not.toBeInTheDocument();
  });

  test('삭제된 할인권종은 fallback으로 다른 미삭제 권종 사용', () => {
    const deletedDiscount = makeDiscount({ id: 'd_old', isDeleted: true });
    const activeDiscount = makeDiscount({ id: 'd_new', name: '장애인할인' });
    const show = makeShow({ discountTypes: [deletedDiscount, activeDiscount] });
    render(
      <QuickAddSheet
        {...baseProps}
        show={show}
        lastUsedDiscountTypeId="d_old"
      />
    );
    // d_old가 삭제됐으므로 d_new로 폴백
    expect(screen.getByText('장애인할인')).toBeInTheDocument();
  });
});
