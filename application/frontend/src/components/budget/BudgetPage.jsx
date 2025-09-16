import { useState, useEffect } from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.payload = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

function BudgetPage({ user, onLogout }) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setMessage("");
      try {
        const data = await request(`/expenses/${encodeURIComponent(user)}`);
        if (mounted) setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessage(err.payload?.message || err.message || "Error fetching expenses");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleAdd = async () => {
    if (!amount || !desc) return;
    const numeric = Number(amount);
    if (isNaN(numeric)) {
      setMessage("Amount must be a number");
      return;
    }

    setMessage("");
    try {
      const data = await request(`/expenses/${encodeURIComponent(user)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numeric, desc }),
      });
      setExpenses(Array.isArray(data) ? data : []);
      setAmount("");
      setDesc("");
    } catch (err) {
      setMessage(err.payload?.message || err.message || "Error adding expense");
    }
  };

  const handleClear = async () => {
    setMessage("");
    try {
      const data = await request(`/expenses/${encodeURIComponent(user)}`, {
        method: "DELETE",
      });
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.payload?.message || err.message || "Error clearing expenses");
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    try {
      const data = await request(
        `/expenses/${encodeURIComponent(user)}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.payload?.message || err.message || "Error deleting expense");
    }
  };

  return (
    <div className="container">
      <div className="headerRow">
        <h3 className="title">Welcome, {user}!</h3>
        <button className="danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      <h2 className="title">Budget Planner</h2>

      <h1 className="total">Total: {total} Ft</h1>

      <ExpenseForm
        amount={amount}
        desc={desc}
        onChangeAmount={setAmount}
        onChangeDesc={setDesc}
        onAdd={handleAdd}
      />

      {message && <p className="serverMessage">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      )}

      {expenses.length > 0 && (
        <button className="clearAll" onClick={handleClear}>
          Clear All
        </button>
      )}
    </div>
  );
}

export default BudgetPage;
