import QueryProvider from "./QueryProvider";
import Router from "./Routes";

function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  );
}

export default App;
