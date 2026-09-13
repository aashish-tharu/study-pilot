import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Login.css"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

async function handleSubmit(e) {
  e.preventDefault();
  try {
    const data = await loginUser(formData);
    localStorage.setItem("accessToken", data.data.accessToken);
    setMessage(data.message);
    navigate("/dashboard");
  } catch (error) {
    setMessage(error.message);
  }
}

  return (
  <div className="login-page">
    <div className="login-box">
      <h1> Study Pilot</h1>
      <h2>Welcome Back</h2>
      <p>Login to continue your study journey.</p>

      <form onSubmit={handleSubmit}>

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

      <p className="login-message">
        {message}
      </p>

      <p className="register-text">
        Don't have an account?{" "}
        <Link to="/register">
          Register
        </Link>
      </p>

    </div>

  </div>
);
}

export default Login;