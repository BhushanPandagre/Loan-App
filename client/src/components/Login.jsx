import React, { useContext, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setToken, setLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
      if (!email || !password) throw "Please fill all fields!";
      const user = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        { email, password }
      );
      setUser(user.data.user);
      setToken(user.data.token);
      setLoggedIn(true);
      localStorage.setItem("token", user.data.token);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(`Can't login!\nError: ${error}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-500">
      <div className="bg-white p-8 rounded shadow-md w-full md:w-96">
        <h2 className="text-4xl font-bold mb-4 text-center text-orange-600">
          Login
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:border-orange-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:border-orange-300"
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="bg-orange-500 text-black px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 w-full"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <a
            href="/signup"
            className="text-black-500 hover:text-blue-700 focus:outline-none focus:underline"
          >
            Create new account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
