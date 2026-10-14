import { useRoute } from "./hooks";
import { AuthProvider, SiteProvider, useAuth, useSite } from "./store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Loading } from "./components/ui";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Search from "./pages/Search";
import Doctor from "./pages/Doctor";
import Book from "./pages/Book";
import Auth from "./pages/Auth";
import Appointments from "./pages/Appointments";
import Dashboard from "./pages/dashboard/Dashboard";

function Shell() {
  const { path, query } = useRoute();
  const { user, ready } = useAuth();
  const { site, error, reload } = useSite();
  if (!site || !ready) return <Loading error={error} retry={reload} />;

  const [page, id, sub] = path.split("/").filter(Boolean);
  const here = location.hash.slice(1) || "/";
  const guarded = ["book", "appointments", "dashboard"].includes(page);
  const isDashboard = page === "dashboard";

  let view;
  if (guarded && !user) view = <Auth next={here} notice="Please log in or sign up to continue." />;
  else if (page === "login")        view = <Auth next={query.next || "/"} />;
  else if (page === "find")         view = <Home />;
  else if (page === "browse")       view = <Browse kind={id} />;
  else if (page === "search")       view = <Search query={query} />;
  else if (page === "doctor")       view = <Doctor id={id} />;
  else if (page === "book")         view = <Book id={id} query={query} />;
  else if (page === "appointments") view = <Appointments query={query} />;
  else if (page === "dashboard")    view = <Dashboard section={id} sub={sub} query={query} />;
  else                              view = <Landing query={query} />;

  // Dashboard has its own full-page layout (sidebar + topbar). No outer navbar/footer.
  if (isDashboard && user) {
    return <div style={{ background: "#F0F4F7" }}>{view}</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8FAF9", color: "#172238" }}>
      <Navbar />
      {view}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </SiteProvider>
  );
}
