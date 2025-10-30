import { Home } from "./pages";
import { RootLayout } from "./components";
import JSONTreeVisualizer from "./JSONTreeVisualizer";
function App() {
  return (
    <RootLayout>
      <Home />
    </RootLayout>
    // <>
    //   <JSONTreeVisualizer />
    // </>
  );
}

export default App;
