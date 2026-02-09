

# Plan: Fix Strategy Creation, Paper Trading Charts, and Learn Section

## 1. Remove AI Chat Tab from Create Strategy

**File:** `src/pages/dashboard/StrategyCreate.tsx`

Remove the "AI Chat" tab from the `TabsList` (line 331-334) and remove the entire `TabsContent value="ai"` block (lines 372-477). This leaves only "Smart Compiler" and "Manual" tabs. Also clean up unused state variables (`aiPrompt`, `aiGenerating`, `messages`, `parsedStrategy`, `messagesEndRef`) and the `handleAiSubmit`, `handleCreateFromAI`, `parseStrategyFromResponse`, `formatDisplayContent` functions. Remove unused imports (`Send`, `Brain`).

---

## 2. Fix Paper Trading Charts with Live Data

### Problem
The `PriceChart` component fetches historical data from the `fetch-prices` edge function. When the Indian API returns historical data, it comes back as a flat array (not wrapped in `{data: [...]}`) but the `useHistoricalPrices` hook expects `result.data` to be an array (line 64). This mismatch means chart data may not render.

### Fix

**File:** `src/hooks/useHistoricalPrices.ts`
- Update the response parsing to handle both formats: `result.data` (wrapped) and flat array `result` (direct from Indian API historical endpoint).
- The edge function returns historical data directly as an array when from Indian API (line 320-323 of fetch-prices), so the hook should check `Array.isArray(result)` as well.

**File:** `supabase/functions/fetch-prices/index.ts`
- Normalize the historical data response to always wrap in `{ data: [...], source: '...', marketStatus: '...' }` so the frontend receives a consistent shape regardless of source (Indian API, cache, or fallback).

---

## 3. Ensure Trade History and Balance Use Live Data Only

### Current State
The Paper Trading page (`PaperTrading.tsx`) already uses the `usePaperTrading` hook which fetches from Supabase tables (`paper_accounts`, `paper_positions`, `paper_trades`). The trade history table and balance display are driven by this live data. **No mock data detected** in the current implementation -- it's already fully dynamic.

### Verification
- Balance comes from `account.current_balance` (line 329)
- Trade history comes from `trades` array fetched from DB (line 508)
- Stats come from `calculateStats(tradesData)` on real closed trades
- Real-time subscriptions are active for positions, trades, and account updates

No changes needed here -- the implementation is already live-data driven.

---

## 4. Debug Learn Section - Journey Tracking

### Issues Found

**Issue A: `getModuleProgress` returns wrong total count**
In `useLessonProgress.ts` line 178-181, `getModuleProgress` counts `total` as `moduleProgress.length` (number of progress records for that module). But the actual total should be the number of lessons in the module from `MODULES`. If a user hasn't visited all lessons, the progress records won't exist yet, making `total` lower than the actual lesson count. This makes the `CourseCard` progress bar incorrect.

**Fix:** `getModuleProgress` should accept the total lesson count or look it up from `MODULES`.

**Issue B: Quiz score calculation in `getOverallStats` is wrong**
Line 187-188 uses `.reduce((sum, p, _, arr) => sum + (p.quiz_score || 0) / arr.length, 0)` which divides each score by arr.length and sums them. This is mathematically correct for average but accumulates floating point errors. More importantly, the `QuizComponent` has a subtle bug at line 49: when calculating the final score on the last question, it checks `isCorrect` based on the current render's `selectedAnswer === question?.correctIndex`, but `correctAnswers` state may not have been updated yet (since `setCorrectAnswers` in `handleSubmit` is async). However, the workaround at line 49 `(correctAnswers + (isCorrect ? 1 : 0))` handles this correctly. The display score at line 64 (`correctAnswers / questions.length`) is consistent.

**Issue C: Navigation state not resetting between lessons**
In `LessonViewer.tsx`, when navigating between lessons, `showQuiz` state persists because React reuses the component (same route pattern). The `showQuiz` state should reset when `lessonId` changes.

**Fix:** Add a `useEffect` to reset `showQuiz` to `false` when `lessonId` changes.

---

## Technical Implementation Summary

| File | Change |
|------|--------|
| `src/pages/dashboard/StrategyCreate.tsx` | Remove AI Chat tab, related state, and functions |
| `supabase/functions/fetch-prices/index.ts` | Normalize historical response to `{ data: [...], source, marketStatus }` |
| `src/hooks/useHistoricalPrices.ts` | Handle both wrapped and flat array responses |
| `src/hooks/useLessonProgress.ts` | Fix `getModuleProgress` to use actual lesson count from MODULES |
| `src/components/learn/LessonViewer.tsx` | Reset `showQuiz` state on lesson change |

