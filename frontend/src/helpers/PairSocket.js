// import moment from "moment";

class PairSocket {
  constructor({ updatePairData }) {
    this.socket = new WebSocket("ws://localhost:8422/ws");
    this.socket.onmessage = this.onMessage.bind(this);
    
    this.updatePairData = updatePairData;
  }

  get readyState() {
    return this.socket.readyState;
  }

  parseIfObject(str) {
    try {
      const result = JSON.parse(str);

      return result;
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return str;
    }
  }

  onMessage(message) {
    const data = this.parseIfObject(message?.data);

    this.updatePairData(data);
  }

  subscribePair(pair) {
    this.socket.send(JSON.stringify({
      action: 'subscribe',
      details: {
        pair
      }
    }))
  }

  unsubscribePair(pair) {
    this.socket.send(JSON.stringify({
      action: 'unsubscribe',
      details: {
        pair
      }
    }))
  }

  close() {
    this.socket.close();
  }
}

export default PairSocket;
