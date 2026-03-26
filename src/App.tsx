import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import DiaryForm from "@/pages/DiaryForm";
import History from "@/pages/History";
import Analysis from "@/pages/Analysis";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DiaryForm />} />
            <Route path="diario/:date" element={<DiaryForm />} />
            <Route path="historico" element={<History />} />
            <Route path="analise" element={<Analysis />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
