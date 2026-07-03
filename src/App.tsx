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
import { C20DateFormatter } from "./pages/C20DateFormatter.tsx";
import { C21TopCustomers } from "./pages/C21TopCustomers.tsx";
import { C22Pagination } from "./pages/C22Pagination.tsx";
import { C23AmountParser } from "./pages/C23AmountParser.tsx";
import { C24SearchRace } from "./pages/C24SearchRace.tsx";
import { C25SaveRefresh } from "./pages/C25SaveRefresh.tsx";
import { C26SortedView } from "./pages/C26SortedView.tsx";
import { C27SettingsLoader } from "./pages/C27SettingsLoader.tsx";
import { C28StatusFilter } from "./pages/C28StatusFilter.tsx";
import { C29PriceTicker } from "./pages/C29PriceTicker.tsx";

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
        <Route path="/c20" element={<C20DateFormatter />} />
        <Route path="/c21" element={<C21TopCustomers />} />
        <Route path="/c22" element={<C22Pagination />} />
        <Route path="/c23" element={<C23AmountParser />} />
        <Route path="/c24" element={<C24SearchRace />} />
        <Route path="/c25" element={<C25SaveRefresh />} />
        <Route path="/c26" element={<C26SortedView />} />
        <Route path="/c27" element={<C27SettingsLoader />} />
        <Route path="/c28" element={<C28StatusFilter />} />
        <Route path="/c29" element={<C29PriceTicker />} />
      </Routes>
    </Layout>
  );
}
