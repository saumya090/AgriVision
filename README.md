# AgriVision – Smart Agriculture Management Platform

AgriVision is a production-ready, full-stack MERN (MongoDB, Express, React, Node) application designed for farmers to manage their operations and for admins to oversee platform statistics, government schemes, and product listings.

---

## 🚀 Tech Stack

- **Frontend**: React.js (Vite), React Router DOM, Axios, Tailwind CSS, Recharts (Visual Analytics), Lucide Icons.
- **Backend**: Node.js, Express.js (MVC Pattern).
- **Database**: MongoDB (via Mongoose ODM).
- **Authentication**: Stateless JWT Authorization, bcrypt password hashing, Role-Based Access Control (RBAC: Farmer / Admin).
- **External Integrations**: OpenWeather API (current weather conditions & 7-day outlook) with custom Mock fallbacks.

---

## 📂 Project Structure

```text
agrivision/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable styling nodes
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # AuthLayout, DashboardLayout
│   │   ├── pages/              # Dashboard, Farms, Crops, Expenses, Marketplace, etc.
│   │   ├── services/           # api.js Axios helper
│   │   ├── App.jsx             # Routes &guards mounting
│   │   └── index.css           # Tailwind base styles
│   ├── index.html              # HTML shell & Google Fonts
│   └── tailwind.config.js      # Utility styling config
│
└── server/                     # Backend API Server
    ├── config/                 # db.js connection configuration
    ├── controllers/            # Logic (auth, farm, crop, harvest, admin, etc.)
    ├── middleware/             # authMiddleware, errorMiddleware
    ├── models/                 # Mongoose schemas (User, Farm, Crop, Product, etc.)
    ├── routes/                 # Express endpoints mappings
    └── server.js               # Express entrypoint
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB] running locally (`mongodb://localhost:27017`) or a MongoDB Atlas Connection String.

### Backend Setup
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Setup environment variables by copying/renaming `.env` and adding your values:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/agrivision
   JWT_SECRET=agrivisionsecretjwtkey12345
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
   *Note: If no OpenWeather API Key is provided, AgriVision automatically operates on a robust mock forecast fallback, ensuring the platform remains fully testable.*
3. Launch the API server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5001`.

### Frontend Setup
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend application will boot on `http://localhost:3000`.

---

## 🌟 Features Breakdown

### 👨‍🌾 Farmer Journey
- **Farms**: Register and monitor land acreage sizes and soil composition (Alluvial, Black, Clayey, Loamy, etc.).
- **Crop Lifecycle**: Schedule crop sowings and monitor timelines (Planned -> Active -> Harvested).
- **Irrigation release**: Schedule watering tasks and log volumetric consumption (Liters & duration).
- **Expenses & Income**: Log seeds, labor, fertilizer, and equipment costs. Review category distributions and monthly revenue trends.
- **Harvest Journals**: Log harvested crop volumes. Revenue is calculated automatically on save.
- **Weather station**: Fetch regional humidity, wind parameters, and 7-day extended forecasts.
- **Schemes browser**: Query national and regional welfare plans and check criteria.
- **Marketplace Listings**: Advertise crop quantities directly to buyers.

### 👮 Admin Portal
- **Dashboard metrics**: Monitor global user bases, registered acreage totals, and platform-wide sales volume.
- **User purging**: Clear/de-register accounts. Triggering delete cascades and purges all of their registered farm details to keep the database optimized.
- **Schemes manager**: Publish new government schemes.
- **Spam monitoring**: Supervise active marketplace listings.

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Install Vercel CLI or link your repository to Vercel.
2. Configure **Environment Variables** in the Vercel console:
   - `VITE_API_URL`: Set to your deployed Render backend URL (e.g. `https://agrivision-api.onrender.com/api`).
3. Set the build commands:
   - Framework preset: `Vite`
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`

### Backend (Render)
1. Create a new **Web Service** on Render and connect your repository.
2. Set the build details:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Configure the following **Environment Variables** in Render:
   - `MONGO_URI`: Your MongoDB Atlas URL connection string.
   - `JWT_SECRET`: A secure key used for JWT signing.
   - `OPENWEATHER_API_KEY`: Your OpenWeather Key.
