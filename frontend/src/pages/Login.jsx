import { useRef, useState } from "react";
import toast from "react-hot-toast";

import authServices from "../services/authServices";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef(null);
  const passRef = useRef(null);

  function handleLogin() {
    const email = emailRef?.current?.value;
    const pass = passRef?.current?.value;

    setIsLoading(true);

    authServices
      .login(email, pass)
      .then(() => {
        toast.success("Successfully logged in! You will be redirected");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      })
      .catch((e) => {
        toast.error(e.message)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="w-2/5 flex flex-col bg-gray-800 rounded-lg ml-4 p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          ref={emailRef}
          className="h-8 border mt-8 text-black rounded-sm"
          id="email"
          type="email"
          placeholder="Email"
        />
        <input
          ref={passRef}
          className="h-8 border mt-2 text-black rounded-sm"
          id="password"
          type="password"
          placeholder="Password"
        />
        <button
          className="relative h-10 mt-4 border-2 rounded-lg hover:bg-gray-300 hover:text-black"
          type="submit"
          onClick={() => {
            handleLogin();
          }}
        >
          Login
          {isLoading && (
            <span className="absolute h-4 w-4 top-2 ml-2 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
        </button>
        <a className="mt-4 w-full text-center hover:underline" href="/register">
          Sign Up
        </a>
      </div>
    </div>
  );
}

export default Login;
