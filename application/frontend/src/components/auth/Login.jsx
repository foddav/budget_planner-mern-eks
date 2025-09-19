import { useState } from "react";

// Load API base from build-time env (import.meta.env), otherwise fall back to the local /api proxy.
const BASE = import.meta.env.VITE_API_BASE ?? "/api";

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

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name || !password) return;

    setLoading(true);
    setMessage("");
    try {
      if (isRegister) {
        const data = await request("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password }),
        });
        setMessage(data.message || "Registration successful");
        setIsRegister(false);
        setUsername("");
        setPassword("");
      } else {
        await request("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password }),
        });
        onLogin(name);
      }
    } catch (err) {
      setMessage(err.payload?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="login-title">{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      {message && <p className="serverMessage">{message}</p>}

      <p>
        {isRegister ? "Already have an account?" : "No account yet?"}{" "}
        <button
          type="button"
          className="secondaryButtons"
          onClick={() => {
            setMessage("");
            setIsRegister((s) => !s);
          }}
        >
          {isRegister ? "Login here" : "Register here"}
        </button>
      </p>
    </div>
  );
}

export default Login;
