import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    if (true) {
      const socket = new WebSocket("ws://localhost:8422/ws");

      socket.onmessage = (m) => console.log(m);
    } else {
      // axios
      //   .request({
      //     url: "/api/user/login",
      //     data: {
      //       email: "test@test.com",
      //       password: "123456",
      //     },
      //     method: "post",
      //   })
      //   .then(() => {
      //     alert("Logged in");
      //   });
    }
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <h1>Hello</h1>
      <button
        onClick={() => {
          axios.request({
            url: "/api/subscriptions/unsubscribe?pair=BNBTC/TRY",
          });
        }}
      >
        Click
      </button>
    </div>
  );
}

export default App;
