# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p2.spec.ts >> [P2-11] 현황 탭 구조 >> P2-11-06 지출 블러 기본 상태 → 금액 블러 처리
- Location: tests\p2.spec.ts:717:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5174/
Call log:
  - navigating to "http://localhost:5174/", waiting until "load"

```

# Test source

```ts
  23  |   id: 'show-001',
  24  |   name: '테스트 공연',
  25  |   venue: '테스트 공연장',
  26  |   startDate: '2026-01-01',
  27  |   endDate: '2030-12-31',
  28  |   color: '#6366f1',
  29  |   seatGrades: [
  30  |     { id: 'grade-vip', name: 'VIP', price: 130000 },
  31  |     { id: 'grade-r', name: 'R석', price: 100000 },
  32  |   ],
  33  |   discountTypes: [
  34  |     { id: 'disc-rebook', name: '재관람', method: 'rate', value: 30, isRebook: true, isCoupon: false },
  35  |     { id: 'disc-matinee', name: '마티네', method: 'rate', value: 20, isRebook: false, isCoupon: false },
  36  |     { id: 'disc-normal', name: '일반', method: 'amount', value: 0, isRebook: false, isCoupon: false },
  37  |   ],
  38  |   stampBoards: [
  39  |     {
  40  |       id: 'board-001',
  41  |       showId: 'show-001',
  42  |       name: '1판',
  43  |       capacity: 7,
  44  |       initialStamps: 0,
  45  |       stamps: [],
  46  |       benefits: [
  47  |         { id: 'benefit-001', requiredStamps: 5, description: '할인쿠폰 30%', priority: 1, isAchieved: false, isUsed: false },
  48  |         { id: 'benefit-002', requiredStamps: 7, description: '포토카드', priority: 2, isAchieved: false, isUsed: false },
  49  |       ],
  50  |       isActive: true,
  51  |       isCompleted: false,
  52  |       sortOrder: 0,
  53  |       createdAt: '2026-01-01T00:00:00.000Z',
  54  |       stampColor: '#6366f1',
  55  |     },
  56  |   ],
  57  |   events: [],
  58  |   specialEvents: [
  59  |     { id: 'se-001', name: '무대인사', showId: 'show-001', startDate: '2026-01-01', endDate: '2030-12-31', isDeleted: false },
  60  |   ],
  61  |   isArchived: false,
  62  |   createdAt: '2026-01-01T00:00:00.000Z',
  63  |   tabOrder: 0,
  64  | };
  65  | 
  66  | export async function installBridge(page: Page) {
  67  |   await page.addInitScript(() => {
  68  |     // Idempotency guard: only install bridge once per page load
  69  |     if ((window as unknown as Record<string, unknown>).__stampitBridgeInstalled) return;
  70  |     (window as unknown as Record<string, unknown>).__stampitBridgeInstalled = true;
  71  | 
  72  |     const REAL_KEY = 'stampit_react_v1';
  73  |     const BRIDGE_KEY = 'stampit:shows';
  74  | 
  75  |     // Migration: if stampit:shows exists but stampit_react_v1 doesn't, migrate
  76  |     const origGetRaw = Storage.prototype.getItem.call(localStorage, REAL_KEY);
  77  |     if (!origGetRaw) {
  78  |       const bridgeRaw = Storage.prototype.getItem.call(localStorage, BRIDGE_KEY);
  79  |       if (bridgeRaw) {
  80  |         try {
  81  |           const shows = JSON.parse(bridgeRaw) as Record<string, unknown>[];
  82  |           const schedules = shows.flatMap((show) =>
  83  |             ((show['schedules'] as Record<string, unknown>[] | undefined) || [])
  84  |               .map((s) => ({ ...s, showId: show['id'] }))
  85  |           );
  86  |           const showsClean = shows.map(({ schedules: _s, ...rest }) => rest);
  87  |           Storage.prototype.setItem.call(localStorage, REAL_KEY, JSON.stringify({ shows: showsClean, schedules }));
  88  |         } catch (_e) { /* ignore */ }
  89  |       }
  90  |     }
  91  | 
  92  |     const origGet = Storage.prototype.getItem;
  93  |     const origSet = Storage.prototype.setItem;
  94  |     Storage.prototype.getItem = function(key: string) {
  95  |       if (this === localStorage && key === BRIDGE_KEY) {
  96  |         const raw = origGet.call(this, REAL_KEY);
  97  |         if (!raw) return null;
  98  |         const data = JSON.parse(raw);
  99  |         const shows = (data.shows || []).map((show: Record<string, unknown>) => ({
  100 |           ...show,
  101 |           schedules: (data.schedules || []).filter((s: Record<string, unknown>) => s['showId'] === show['id']),
  102 |         }));
  103 |         return JSON.stringify(shows);
  104 |       }
  105 |       return origGet.call(this, key);
  106 |     };
  107 |     Storage.prototype.setItem = function(key: string, value: string) {
  108 |       if (this === localStorage && key === BRIDGE_KEY) {
  109 |         const shows = JSON.parse(value);
  110 |         const schedules = (shows as Record<string, unknown>[]).flatMap((show) =>
  111 |           ((show['schedules'] as Record<string, unknown>[] | undefined) || [])
  112 |             .map((s) => ({ ...s, showId: show['id'] }))
  113 |         );
  114 |         const showsClean = (shows as Record<string, unknown>[]).map(({ schedules: _s, ...rest }) => rest);
  115 |         origSet.call(this, REAL_KEY, JSON.stringify({ shows: showsClean, schedules }));
  116 |         return;
  117 |       }
  118 |       origSet.call(this, key, value);
  119 |     };
  120 |   });
  121 |   // Navigate to app so that localStorage is accessible for page.evaluate() calls
  122 |   if (page.url() === 'about:blank' || page.url() === '') {
> 123 |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5174/
  124 |   }
  125 | }
  126 | 
  127 | export async function clearStorage(page: Page) {
  128 |   await installBridge(page);
  129 |   await page.goto('/');
  130 |   await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  131 | }
  132 | 
  133 | export async function seedShow(page: Page) {
  134 |   await installBridge(page);
  135 |   await page.goto('/');
  136 |   await page.evaluate(
  137 |     ({ key, show, settingsKey }) => {
  138 |       localStorage.setItem(key, JSON.stringify({ shows: [show], schedules: [] }));
  139 |       localStorage.setItem(settingsKey, JSON.stringify({ showRealCost: true, onboardingDone: true }));
  140 |     },
  141 |     { key: STORAGE_KEY, show: BASE_SHOW, settingsKey: 'stampit_settings' }
  142 |   );
  143 | }
  144 | 
  145 | interface SeedScheduleOpts {
  146 |   id?: string;
  147 |   date?: string;
  148 |   seatGradeId?: string;
  149 |   discountTypeId?: string;
  150 |   finalPrice?: number;
  151 |   originalPrice?: number;
  152 |   isConfirmed?: boolean;
  153 |   status?: 'draft' | 'confirmed' | 'cancelled';
  154 |   cast?: string;
  155 |   specialEventIds?: string[];
  156 |   multiplier?: number;
  157 |   boardAllocations?: unknown[];
  158 |   priceDiffNote?: string;
  159 |   isShare?: boolean;
  160 | }
  161 | 
  162 | export async function seedSchedule(page: Page, opts: SeedScheduleOpts = {}) {
  163 |   const isConfirmed = opts.isConfirmed ?? (opts.status === 'confirmed');
  164 |   const schedule = {
  165 |     id: opts.id ?? 'sched-001',
  166 |     showId: 'show-001',
  167 |     date: opts.date ?? todayISOStr(),
  168 |     seatGradeId: opts.seatGradeId ?? 'grade-r',
  169 |     discountTypeId: opts.discountTypeId ?? 'disc-normal',
  170 |     finalPrice: opts.finalPrice ?? 100000,
  171 |     originalPrice: opts.originalPrice ?? 100000,
  172 |     multiplier: opts.multiplier ?? 1,
  173 |     boardAllocations: opts.boardAllocations ?? [],
  174 |     isConfirmed,
  175 |     status: opts.status ?? 'draft',
  176 |     specialEventIds: opts.specialEventIds ?? [],
  177 |     cast: opts.cast,
  178 |     priceDiffNote: opts.priceDiffNote,
  179 |     isShare: opts.isShare,
  180 |     createdAt: '2026-01-01T00:00:00.000Z',
  181 |     // Set confirmedAt to now so canCancelConfirm works
  182 |     confirmedAt: isConfirmed ? new Date().toISOString() : undefined,
  183 |   };
  184 | 
  185 |   await installBridge(page);
  186 |   await page.goto('/');
  187 |   await page.evaluate(
  188 |     ({ key, schedule: sched }) => {
  189 |       const raw = localStorage.getItem(key);
  190 |       const data = raw ? JSON.parse(raw) : { shows: [{ id: 'show-001' }], schedules: [] };
  191 |       data.schedules = [...(data.schedules || []).filter((s: { id: string }) => s.id !== sched.id), sched];
  192 |       localStorage.setItem(key, JSON.stringify(data));
  193 |     },
  194 |     { key: STORAGE_KEY, schedule }
  195 |   );
  196 | }
  197 | 
  198 | export async function setStorage(page: Page, shows: unknown[]) {
  199 |   await installBridge(page);
  200 |   await page.goto('/');
  201 |   await page.evaluate(
  202 |     ({ key, shows: showList, settingsKey }) => {
  203 |       const schedules = (showList as Record<string, unknown>[]).flatMap((show) =>
  204 |         ((show['schedules'] as Record<string, unknown>[] | undefined) || [])
  205 |           .map((s) => ({ ...s, showId: show['id'] }))
  206 |       );
  207 |       const showsClean = (showList as Record<string, unknown>[]).map(({ schedules: _s, ...rest }) => rest);
  208 |       localStorage.setItem(key, JSON.stringify({ shows: showsClean, schedules }));
  209 |       localStorage.setItem(settingsKey, JSON.stringify({ showRealCost: true, onboardingDone: true }));
  210 |     },
  211 |     { key: STORAGE_KEY, shows, settingsKey: 'stampit_settings' }
  212 |   );
  213 | }
  214 | 
  215 | export async function getStorage<T>(page: Page, key: string): Promise<T | null> {
  216 |   const raw = await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY);
  217 |   if (!raw) return null;
  218 |   const data = JSON.parse(raw) as { shows: Record<string, unknown>[]; schedules: Record<string, unknown>[] };
  219 | 
  220 |   if (key === 'stampit:shows') {
  221 |     const showsWithSchedules = data.shows.map((show) => ({
  222 |       ...show,
  223 |       schedules: (data.schedules || []).filter((s) => s['showId'] === show['id']),
```