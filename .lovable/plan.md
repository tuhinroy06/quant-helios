

# Comprehensive Bug Fix Plan

## Bug 1: Console Ref Warnings on Landing Page (Active Error)

**Problem:** Console shows "Function components cannot be given refs" errors for `FeaturesSection`, `CTASection`, and `Footer` in the `Index` page. These are plain function components that need to accept refs.

**Fix:** Wrap `FeaturesSection`, `CTASection`, and `Footer` with `React.forwardRef` so they can accept refs without warnings.

**Files:**
- `src/components/landing/FeaturesSection.tsx`
- `src/components/landing/CTASection.tsx`
- `src/components/landing/Footer.tsx`

---

## Bug 2: Quiz Score Off-By-One (Still Present)

**Problem:** In `QuizComponent.tsx` line 49, `handleNext` calculates `finalScore` using `correctAnswers` before the `setCorrectAnswers` state update from `handleSubmit` has taken effect. If the last answer is correct, it gets counted by `setCorrectAnswers` (async) but the `finalScore` calculation on line 49 uses the stale value. Result: scoring 3/3 reports as 66%.

**Fix:** Change line 49 from:
```
const finalScore = Math.round((correctAnswers / questions.length) * 100);
```
to:
```
const currentCorrect = correctAnswers + (isCorrect ? 1 : 0);
const finalScore = Math.round((currentCorrect / questions.length) * 100);
```

**File:** `src/components/learn/QuizComponent.tsx`

---

## Bug 3: Helios AI Hardcoded Market Data

**Problem:** `StoxoAI.tsx` lines 94-98 show static hardcoded values for NIFTY 50 (24,250), SENSEX (79,820), and BANK NIFTY (52,150) that never update.

**Fix:** Replace static `marketStats` array with live data fetched via the `useAlphaVantagePrices` hook (already used elsewhere in the app).

**File:** `src/pages/dashboard/StoxoAI.tsx`

---

## Bug 4: Unused `Brain` Import in StrategyCreate

**Problem:** `Brain` is imported on line 3 of `StrategyCreate.tsx` but is used on lines 138 and 164. Wait -- it IS still used (for the compiler tab icon and the "About" section). This is NOT a bug. Keeping as-is.

---

## Bug 5: Settings `as any` Type Cast

**Problem:** Line 90 of `Settings.tsx` uses `.from("strategies" as any)` which suppresses type checking. The `strategies` table may not be in the generated types, so this cast was added as a workaround.

**Fix:** Keep the cast but add a comment explaining why, OR check if `strategies` exists in the types file and remove the cast if it does.

**File:** `src/pages/dashboard/Settings.tsx`

---

## Bug 6: Paper Trading Sell Orders Don't Deduct Balance

**Problem:** In `QuickTradePanel.tsx` lines 213-221, only buy orders deduct from the account balance. Sell (short) orders have no balance impact, allowing unlimited short positions without capital requirements.

**Fix:** For sell orders, deduct at minimum the transaction costs from the balance. This ensures shorts are not "free" and maintains accounting consistency.

**File:** `src/components/paper-trading/QuickTradePanel.tsx`

---

## Bug 7: PriceChart Shows No Error State

**Problem:** When `useHistoricalPrices` returns an error, the chart component does not display any error feedback to the user -- it just shows an empty chart area.

**Fix:** Add an error state with a message and retry button when `error` is truthy.

**File:** `src/components/paper-trading/PriceChart.tsx`

---

## Summary of Changes

| File | Change | Severity |
|------|--------|----------|
| `FeaturesSection.tsx` | Wrap with `forwardRef` | Medium (console spam) |
| `CTASection.tsx` | Wrap with `forwardRef` | Medium (console spam) |
| `Footer.tsx` | Wrap with `forwardRef` | Medium (console spam) |
| `QuizComponent.tsx` | Fix final score calculation | High (wrong score) |
| `StoxoAI.tsx` | Replace hardcoded market stats with live data | Medium (misleading data) |
| `Settings.tsx` | Clean up `as any` cast | Low (code quality) |
| `QuickTradePanel.tsx` | Deduct costs for sell orders | Medium (accounting) |
| `PriceChart.tsx` | Add error state UI | Low (UX improvement) |

