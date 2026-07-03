// Single source of truth for the challenges: id, number, page title, group,
// and the symptom-only brief (expected vs observed) shown on each page. The
// brief MUST NOT name the cause, fix, file, or line.

export type Group = "Data entry" | "Performance" | "Async & state";

// Sidebar/Home group order.
export const GROUPS: Group[] = ["Data entry", "Performance", "Async & state"];

export interface Challenge {
  id: string; // route segment, e.g. "c01"
  num: number;
  title: string;
  group: Group;
  expected: string;
  observed: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "c01",
    num: 1,
    title: "Add Customer",
    group: "Data entry",
    expected:
      "Creating a customer through the API should reject obviously bad data (empty name, malformed email) with an error and not store it.",
    observed:
      "A junk record with a malformed email got saved anyway when the request didn't come from our form.",
  },
  {
    id: "c02",
    num: 2,
    title: "Email Field Validator",
    group: "Data entry",
    expected:
      "The email field should accept normal valid addresses and reject clearly invalid ones.",
    observed:
      "Some real addresses are refused, and some obvious non-addresses are waved through.",
  },
  {
    id: "c03",
    num: 3,
    title: "Required Notes Field",
    group: "Data entry",
    expected:
      "A required field must contain actual content before the form can be submitted.",
    observed:
      "Submitting with the field 'filled' by only spaces is accepted as valid.",
  },
  {
    id: "c04",
    num: 4,
    title: "Order Quantity Total",
    group: "Data entry",
    expected:
      "Entering quantities should produce a correct numeric line-item total.",
    observed:
      "The total comes out as nonsense (concatenated digits or NaN) for some inputs.",
  },
  {
    id: "c05",
    num: 5,
    title: "Stock Adjustment",
    group: "Data entry",
    expected:
      "Stock quantity must stay within allowed bounds — no negatives, no values above the cap.",
    observed:
      "Negative quantities and absurdly large values are accepted and saved.",
  },
  {
    id: "c06",
    num: 6,
    title: "Edit Customer Form",
    group: "Data entry",
    expected:
      "Typing into each field of the edit form should update that field and keep what you typed.",
    observed:
      "One field won't hold edits — it ignores typing or snaps back to the old value.",
  },
  {
    id: "c07",
    num: 7,
    title: "Customer De-dupe",
    group: "Data entry",
    expected:
      "Adding the same customer name twice should be recognized as a duplicate, regardless of casing or surrounding spaces.",
    observed:
      "\"Seth\" and \"seth \" both get added as if they were two different people.",
  },
  {
    id: "c08",
    num: 8,
    title: "Toggle Order Status",
    group: "Data entry",
    expected:
      "If saving a status change fails, the row should return to its previous value.",
    observed:
      "When the save fails the row keeps showing the new status that never actually saved.",
  },
  {
    id: "c09",
    num: 9,
    title: "Customer Notes Display",
    group: "Data entry",
    expected:
      "Notes typed by a user should display as plain text exactly as written.",
    observed:
      "Markup typed into a note is being interpreted by the page instead of shown as text.",
  },
  {
    id: "c10",
    num: 10,
    title: "Invoice Totals",
    group: "Data entry",
    expected:
      "Summing line-item prices should give an exact money total to the cent.",
    observed:
      "Totals are sometimes off by a fraction of a cent (e.g. 0.30000000000000004).",
  },
  {
    id: "c11",
    num: 11,
    title: "Orders List",
    group: "Performance",
    expected:
      "Loading the orders list (with each order's customer) should take one database query.",
    observed:
      "Opening the list fires a flood of database queries that scales with the number of rows.",
  },
  {
    id: "c12",
    num: 12,
    title: "Live Orders Widget",
    group: "Performance",
    expected:
      "The recent-orders widget should fetch its data once when it mounts.",
    observed:
      "The widget hammers the endpoint over and over after mounting.",
  },
  {
    id: "c13",
    num: 13,
    title: "Product Row (memoized)",
    group: "Performance",
    expected:
      "Interacting with the page should not re-render the memoized product rows.",
    observed:
      "Every unrelated state change re-renders every row even though their data is unchanged.",
  },
  {
    id: "c14",
    num: 14,
    title: "All Products Table",
    group: "Performance",
    expected:
      "The products view should only mount a small page of rows at a time.",
    observed:
      "Thousands of row elements are mounted at once and the view is sluggish.",
  },
  {
    id: "c15",
    num: 15,
    title: "Order Enrichment",
    group: "Performance",
    expected:
      "Matching orders to customers for display should scale roughly linearly with the data.",
    observed:
      "The view does dramatically more work than the data size warrants and stutters.",
  },
  {
    id: "c16",
    num: 16,
    title: "Customer Lookup Cache",
    group: "Performance",
    expected:
      "The lookup cache should stay bounded no matter how many distinct queries are made.",
    observed:
      "Memory keeps climbing as you search — the cache grows without limit.",
  },
  {
    id: "c17",
    num: 17,
    title: "Revenue Report",
    group: "Performance",
    expected:
      "The expensive revenue calculation should run only when its inputs change.",
    observed:
      "The heavy calculation re-runs on every keystroke in an unrelated field, freezing the UI.",
  },
  {
    id: "c18",
    num: 18,
    title: "Dashboard Summary",
    group: "Performance",
    expected:
      "The three summary tiles should load together in parallel (~150ms).",
    observed:
      "The tiles load one after another and the page takes ~450ms to fill in.",
  },
  {
    id: "c19",
    num: 19,
    title: "Customer Search",
    group: "Performance",
    expected:
      "Search-as-you-type should wait for a pause in typing before calling the API.",
    observed:
      "Every single keystroke fires its own API request.",
  },
  {
    id: "c20",
    num: 20,
    title: "Order Date Formatter",
    group: "Data entry",
    expected:
      "Dates from the API should display as exactly the calendar date they represent.",
    observed:
      "Some orders display a date that doesn't match the record — occasionally even the wrong year.",
  },
  {
    id: "c21",
    num: 21,
    title: "Top Customers Ranking",
    group: "Data entry",
    expected:
      "The leaderboard should rank customers by revenue, highest first.",
    observed:
      "The order is scrambled — a $900 customer outranks a $12,000 one.",
  },
  {
    id: "c22",
    num: 22,
    title: "Customers Pagination",
    group: "Data entry",
    expected:
      "Every page of results shows its own slice of rows; the last page shows the remainder.",
    observed:
      "Page 1 looks fine, but page 2 onward comes up empty even though there are more rows.",
  },
  {
    id: "c23",
    num: 23,
    title: "Amount Field Parser",
    group: "Data entry",
    expected:
      "Typed amounts like \"1,234.56\" or \"$12\" should be stored as exactly the value entered.",
    observed:
      "Amounts with thousands separators get saved as a tiny fraction of what was typed.",
  },
  {
    id: "c24",
    num: 24,
    title: "Search Results Race",
    group: "Async & state",
    expected:
      "Search results always correspond to the latest thing you typed.",
    observed:
      "Results sometimes flick back to an earlier, shorter query after you finish typing.",
  },
  {
    id: "c25",
    num: 25,
    title: "Save & Refresh",
    group: "Async & state",
    expected:
      "After adding a note, the refreshed list includes the note that was just saved.",
    observed:
      "The new note only shows up after a second, manual refresh.",
  },
  {
    id: "c26",
    num: 26,
    title: "Sorted Product View",
    group: "Async & state",
    expected:
      "Opening the sorted preview leaves the original feed order untouched.",
    observed:
      "Opening the sorted preview silently reorders the original feed list too.",
  },
  {
    id: "c27",
    num: 27,
    title: "Saved Settings Loader",
    group: "Async & state",
    expected:
      "Corrupt or legacy saved settings fall back to the defaults — loading never fails.",
    observed:
      "A corrupt stored value crashes the settings loader instead of falling back.",
  },
  {
    id: "c28",
    num: 28,
    title: "Order Status Filter",
    group: "Performance",
    expected:
      "Filtering orders by status downloads one page of rows (at most the requested limit).",
    observed:
      "The filter downloads every matching row — hundreds of rows per request.",
  },
  {
    id: "c29",
    num: 29,
    title: "Live Price Ticker",
    group: "Async & state",
    expected:
      "Removing the ticker widget stops its background polling.",
    observed:
      "Polling keeps running after the ticker is gone, piling up the longer the page is open.",
  },
];

export function challengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
