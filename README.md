# Binance Trading Pairs

This application provides a platform to interact with Binance's real-time trading data. Users can view live ticker information and manage their subscription preferences for trading pairs.

## Features

### Frontend
- **Client-Side Rendered**: The frontend is rendered on the client and served by the backend.
- **Real-Time Updates**: Displays real-time ticker data fetched from the Binance WebSocket.

### Backend
- **REST API**: Provides endpoints to manage user preferences and configurations.
- **WebSocket Server**: Facilitates real-time communication with the frontend.
- **Subscription Management**: Manages user trading pair subscriptions using topics.
- **Integration with Binance**: Listens to the Binance WebSocket for subscribed trading pairs.
- **Persistence**: Stores user preferences in a PostgreSQL database.

---

## Prerequisites

To run the application, ensure the following dependencies are installed:
1. **PostgreSQL**
2. **Redis**

---

## Configuration

Update the configuration file with the required database credentials and connection details. If the application will not be run locally, replace the placeholder values with the appropriate configurations.

```json
{
  "db": {
    "postgres": {
      "host": "localhost",
      "port": 5432,
      "database": "",
      "user": "postgres",
      "password": "postgres"
    },
    "redis": {
      "url": "redis://localhost:6379/1"
    }
  }
}
```

---

## Running the Application

### Install Dependencies
Ensure you have `yarn` installed and run the following command to install dependencies:
```bash
yarn install
```

### Start Redis
To start Redis, run:
```bash
yarn run:redis
```

### Start the Application in Dev Environment
Run the application in local:
```bash
yarn dev # concurrent run

yarn frontend:dev

yarn server:dev
```

---

## API Details

### REST API
The backend provides a REST API for managing user subscriptions and preferences. Detailed documentation for the API endpoints will be found in `/docs`.

### WebSocket Server
The WebSocket server enables real-time updates for subscribed trading pairs. Subscriptions are topic-based, ensuring efficient management of trading data streams.

---

## Development
Contributions are welcome! Follow these steps for local development:
1. Fork the repository.
2. Clone the repository to your machine.
3. Set up PostgreSQL and Redis locally.
4. Replace configuration values in the `config` file.
5. Use `yarn dev` to start the application in development mode.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Happy Trading! 🚀