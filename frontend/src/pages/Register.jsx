import { useRef } from "react";
import authServices from "../services/authServices";

function Register() {
  const emailRef = useRef(null);
  const passRef = useRef(null);

  function handleRegister() {
    const email = emailRef?.current?.value;
    const pass = passRef?.current?.value;

    authServices.register(email, pass).then(() => {
      window.location.href = "/dashboard";
    });
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 flex items-center justify-center">
      <div className="w-2/5 flex flex-col bg-gray-800 rounded-lg ml-4 p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Register</h1>
        <input
          ref={emailRef}
          className="h-8 border mt-8 text-black"
          id="email"
          type="email"
          placeholder="Email"
        />
        <input
          ref={passRef}
          className="h-8 border mt-2 text-black"
          id="password"
          type="password"
          placeholder="Password"
        />
        <button
          className="mt-4"
          type="submit"
          onClick={() => {
            handleRegister();
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
