import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./context/AppProviders";
import { AppRouter } from "./routes/AppRouter";
import { ScrollToTop } from "./routes/ScrollToTop";
export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <ScrollToTop />
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}
