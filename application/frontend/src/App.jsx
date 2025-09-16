import { useState } from "react";
import Login from "./components/auth/Login.jsx";
import BudgetPage from "./components/budget/BudgetPage.jsx";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => setUser(username);
  const handleLogout = () => setUser(null);

  return user ? (
    <BudgetPage user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;
