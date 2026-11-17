import { createRoot } from "react-dom/client";
import "./index.css";

const path = location.pathname.replace(/\/+/g, "/").replace(/\/index\.html$/, "/");
const canonical = path.replace(/\/+$/, "") + "/";
const isSetup = canonical === "/my-minecraft-setup/";
if ((isSetup || canonical === "/") && location.pathname !== canonical)
  location.replace(canonical + location.search + location.hash);

const App = isSetup ? (await import("./MinecraftSetup")).default : (await import("./App")).default;
createRoot(document.getElementById("root")!).render(canonical === "/" || isSetup ? <App /> : (
  <main className="max-w-5xl mx-auto px-6 py-12">
    <h1 className="font-display text-3xl font-bold">Page not found</h1>
    <a href="/" className="inline-block mt-4 text-link hover:underline">Return to ÉvModder</a>
  </main>
));
