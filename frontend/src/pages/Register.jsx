import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }
 
async function handleSubmit(e) {
  e.preventDefault();

  try {
    const data = await registerUser(formData);

    console.log(data);
    setMessage(data.message);
  } catch (error) {
    console.log(error);
    setMessage(error.message);
  }
}

 return (
  <div className="register-page">
    <div className="register-box">
      <h1>Study Pilot</h1>
      <h2>Create Account</h2>
      <p>Create your account to start studying.</p>

      <form onSubmit={handleSubmit}>

        <label>Username</label>
        <input
          name="username"
          type="text"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <label>Full Name</label>
        <input
          name="fullName"
          type="text"
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Register
        </button>

      </form>

      <p className="register-message">
        {message}
      </p>

      <p className="login-text">
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>

    </div>

  </div>
);
}

export default Register;