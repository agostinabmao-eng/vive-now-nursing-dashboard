# Nursing Efficiency Dashboard — Export

This folder contains all files for the **Nursing Efficiency Dashboard** feature, ready to be integrated into the Admin Portal.

---

## What this feature does

A management-facing dashboard that shows how efficiently nurses are spending their paid hours relative to their documented activity (calls and SMS). It answers: *"For every hour a nurse is paid, how much of it is accounted for by verified clinical activity?"*

It is **read-only** for managers. Nurses interact with a separate data-entry flow (see [Pending work](#pending-work) below).

---

## File structure

```
components/
  EfficiencyBadge.tsx           — Colored pill badge (high / medium / low / none tier)
  EfficiencySummaryTable.tsx    — Main data table (Team Summary view)
  NurseCompareMatrixTable.tsx   — Side-by-side efficiency comparison per nurse (Compare view)
  NurseEfficiencyChart.tsx      — Line chart of efficiency over time per nurse (Chart view)
  NursingEfficiencyDashboard.tsx — Root component, composes filters + views
  NursingEfficiencyFilters.tsx  — Nurse, Practice, Date Range, and View filters bar
  NursingEfficiencyViewSwitcher.tsx — Tab switcher: Team Summary / Compare Nurses / Chart

lib/
  types.ts          — All TypeScript types for the feature
  utils.ts          — Pure functions: bucketing, computing efficiency, formatting durations
  copy.ts           — All user-facing tooltip strings
  hooks/
    useNursingEfficiency.ts — All state and derived data (filters, rows, totals, chart series)
  dev/
    nursing-efficiency-mock.ts — Mock data layer (replace with real API calls)
```

---

## Data sources per column

### Team Summary table columns (left → right)

| Column | Source | Status | Notes |
|---|---|---|---|
| **Week / Day** | Computed from the selected date range | ✅ Frontend only | Shows week ranges for month+ presets; shows individual days for "This Week" / "Last Week" presets |
| **Calls Made** | **DialPad API** | 🔴 Mock | Total outbound + inbound calls initiated by the nurse in the period |
| **Calls Completed** | **DialPad API** (CPT-eligible calls) | 🔴 Mock | Calls that qualify for CPT billing — a subset of Calls Made. Currently using the same DialPad source |
| **SMS Sent** | **DialPad API** | 🔴 Mock | Total SMS messages sent by the nurse in the period |
| **Estimated Care Time** | Computed from the three columns above | ✅ Frontend only | `(Calls Made × 10 min) + (Calls Completed × 25 min) + (SMS Sent × 2 min)`. Time standards are hardcoded constants in `utils.ts → DEFAULT_TIME_ALLOCATION` — should become admin-configurable settings |
| **Paid Time** | **Nurse self-report (end-of-shift entry)** | 🔴 Not built yet | See [Pending work](#pending-work) below. Currently sourced from Gusto payroll mock |
| **Efficiency** | Computed | ✅ Frontend only | `Estimated Care Time ÷ Paid Time × 100`. Displayed as a colored badge: green > 70%, yellow 35–70%, red < 35% |

---

## How efficiency is calculated

```
Estimated Care Time (minutes) =
    (Calls Made × 10) + (Calls Completed × 25) + (SMS Sent × 2)

Efficiency % = Estimated Care Time ÷ Paid Time × 100
```

Time standards (10 / 25 / 2 min) are defined in `lib/utils.ts → DEFAULT_TIME_ALLOCATION`. These should become configurable per organization in the Admin Portal settings.

---

## Views

### Team Summary
Default view. One row per time period (week or day depending on date range preset). Shows aggregated metrics across all selected nurses/practices. Includes a Totals footer row.

### Compare Nurses
Only available when "All Vive Nurses" is selected. Matrix table with one row per week and one column per nurse, showing each nurse's efficiency badge. Good for spotting outliers.

### Chart
Line chart of efficiency % over time, one line per nurse. Uses Plotly.js (`react-plotly.js`). Responsive via `useResizeObserver`.

---

## Filters

| Filter | Behavior |
|---|---|
| **Nurse** | Filter to a single nurse or show all. When a single nurse is selected, "Compare Nurses" view is hidden |
| **Practice** | Filter activity metrics to a specific practice |
| **Date Range** | Supports presets: This Week, Last Week, This Month, Last Month, Previous 30 Days, Today, Yesterday, Custom. Week presets trigger daily granularity in the table |

---

## Dependencies to re-wire in the Admin Portal

These imports reference Provider Portal internal libraries. Each needs a counterpart in the new repo:

| Import | What it does | Action needed |
|---|---|---|
| `@/lib/utils/style` → `cn()` | Tailwind class merging (`clsx` + `tailwind-merge`) | Copy or replace with equivalent |
| `@/lib/enrollment/styles` | Shared CSS class constants (`ENROLLMENT_CONTENT_SHELL`, `ENROLLMENT_SECTION_LABEL`, etc.) | Recreate with Admin Portal equivalents or inline the classes |
| `@/components/ui/datetime/DateTimeRange` | Date range picker with presets | Replace with Admin Portal's date picker component |
| `@/components/ui/dropDownMenu` | Dropdown/select component | Replace with Admin Portal's dropdown |
| `@/components/ui/tooltip` | Radix UI tooltip wrapper | Replace with Admin Portal's tooltip |
| `@/lib/hooks/useResizeObserver` | Watches container width for chart responsiveness | Copy the hook or use a library equivalent |
| `@/types/report` → `DateRangePreset` | Union type for date presets | Copy the type definition |
| `react-day-picker` → `DateRange` | Type for `{ from: Date, to: Date }` | Add `react-day-picker` as a dependency or redefine the type |
| `react-plotly.js` | Chart rendering | Add as a dependency: `npm install react-plotly.js plotly.js` |
| `@headlessui/react` | Tab components in the view switcher | Add as a dependency or replace with Admin Portal's tabs |
| `date-fns` | Date math (week buckets, day buckets) | Add as a dependency: `npm install date-fns` |
| `dayjs` | Date formatting in labels | Add as a dependency or replace with `date-fns/format` |

---

## Mock data

All mock data lives in `lib/dev/nursing-efficiency-mock.ts`. It simulates:
- **DialPad metrics** (calls made, calls completed, SMS sent) per nurse / practice / week
- **Gusto paid hours** per nurse / week (fallback until the real Paid Time flow is built)

Replace `getMockDialPadMetrics` and `getMockGustoPaidHours` in the hook (`useNursingEfficiency.ts`) with real API calls when integrating.

---

## Pending work

### 🔴 Nurse daily hours self-report (Paid Time data entry)
Paid Time is currently mocked. The real source is **nurse self-report at end of shift**:

- When a nurse tries to log out of the Provider Portal, a modal/module will appear asking *"How many hours did you work today?"*
- That value gets stored and fed into this dashboard as the Paid Time column.
- **This flow has not been designed yet** — it is the next step after this feature is integrated into the Admin Portal.
- On the Admin Portal side, the `getMockGustoPaidHours` function in the hook should be replaced with an API call that reads those submitted values.

### 🟡 Activity Time Standards as admin settings
The 10 / 25 / 2 minute standards per activity type are currently hardcoded in `lib/utils.ts → DEFAULT_TIME_ALLOCATION`. These should be configurable per organization from an Admin Settings page.

### 🟡 Role gating
Access to this dashboard should be restricted to management roles. Not enforced in the current prototype — pending confirmation from team lead on role definitions.

### 🟡 Real DialPad integration
`getMockDialPadMetrics` needs to be replaced with a real DialPad API or webhook integration that provides per-nurse, per-practice, per-period call and SMS counts.
