import { Routes, Route } from "react-router-dom";
import { Layout } from "./shared/Layout.tsx";
import { Home } from "./pages/Home.tsx";
import { C01AddCustomer } from "./pages/C01AddCustomer.tsx";
import { C02EmailValidator } from "./pages/C02EmailValidator.tsx";
import { C03RequiredNotes } from "./pages/C03RequiredNotes.tsx";
import { C04QuantityTotal } from "./pages/C04QuantityTotal.tsx";
import { C05StockAdjust } from "./pages/C05StockAdjust.tsx";
import { C06EditForm } from "./pages/C06EditForm.tsx";
import { C07Dedupe } from "./pages/C07Dedupe.tsx";
import { C08ToggleStatus } from "./pages/C08ToggleStatus.tsx";
import { C09NotesDisplay } from "./pages/C09NotesDisplay.tsx";
import { C10InvoiceTotals } from "./pages/C10InvoiceTotals.tsx";
import { C11OrdersList } from "./pages/C11OrdersList.tsx";
import { C12LiveWidget } from "./pages/C12LiveWidget.tsx";
import { C13MemoRows } from "./pages/C13MemoRows.tsx";
import { C14AllProducts } from "./pages/C14AllProducts.tsx";
import { C15Enrichment } from "./pages/C15Enrichment.tsx";
import { C16LookupCache } from "./pages/C16LookupCache.tsx";
import { C17RevenueReport } from "./pages/C17RevenueReport.tsx";
import { C18DashboardSummary } from "./pages/C18DashboardSummary.tsx";
import { C19CustomerSearch } from "./pages/C19CustomerSearch.tsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/c01" element={<C01AddCustomer />} />
        <Route path="/c02" element={<C02EmailValidator />} />
        <Route path="/c03" element={<C03RequiredNotes />} />
        <Route path="/c04" element={<C04QuantityTotal />} />
        <Route path="/c05" element={<C05StockAdjust />} />
        <Route path="/c06" element={<C06EditForm />} />
        <Route path="/c07" element={<C07Dedupe />} />
        <Route path="/c08" element={<C08ToggleStatus />} />
        <Route path="/c09" element={<C09NotesDisplay />} />
        <Route path="/c10" element={<C10InvoiceTotals />} />
        <Route path="/c11" element={<C11OrdersList />} />
        <Route path="/c12" element={<C12LiveWidget />} />
        <Route path="/c13" element={<C13MemoRows />} />
        <Route path="/c14" element={<C14AllProducts />} />
        <Route path="/c15" element={<C15Enrichment />} />
        <Route path="/c16" element={<C16LookupCache />} />
        <Route path="/c17" element={<C17RevenueReport />} />
        <Route path="/c18" element={<C18DashboardSummary />} />
        <Route path="/c19" element={<C19CustomerSearch />} />
      </Routes>
    </Layout>
  );
}
