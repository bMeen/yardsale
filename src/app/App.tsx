import QueryProvider from "./providers/QueryProvider";
import Router from "./routes/Routes";

function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  );
}

export default App;
