import AllRoutes from "./routes/all-routes";
import { NotificationProvider } from "./features/notification/notification-context";

function App() {
  return (
    <NotificationProvider>
      <AllRoutes />
    </NotificationProvider>
  );
}

export default App;
