# DROPME – Smart City-to-City Travel Marketplace

**Find a ride. Share the journey. Travel smarter.**


live at : https://dropme-0cve.onrender.com/

DROPME is a smart city-to-city travel marketplace designed to connect travellers with independent car owners and drivers who are planning journeys between cities.

The platform enables drivers to publish upcoming trips, specify available passenger seats, set fares, and manage booking requests. Travellers can search for rides, compare available vehicles, view driver information, and request seats for their journeys.

DROPME aims to make long-distance travel more affordable, convenient, and efficient by helping drivers share travel costs and making better use of available vehicle seats.

---

## 🚗 Project Overview

Travelling between cities can be expensive and sometimes difficult to plan. DROPME provides a platform where drivers and travellers can connect and coordinate shared journeys.

For example:
- A driver travelling from Hyderabad to Vijayawada can publish an upcoming trip.
- Travellers looking for the same route can discover the available ride.
- Passengers can request seats.
- The driver can accept or reject booking requests.

This creates a convenient travel-sharing ecosystem for both drivers and passengers.

## ✨ Key Features

### 👤 User Management
- User registration and login.
- Secure authentication.
- Role-based access for travellers, drivers, and administrators.
- User profile management.

### 🚘 Driver Features
- Driver registration and profile management.
- Vehicle registration and information management.
- Publish upcoming trips.
- Set departure dates and times.
- Specify available passenger seats.
- Set fare per passenger.
- Manage booking requests.
- View upcoming and completed trips.

### 🔍 Ride Search
- Search rides by source and destination.
- Select travel date.
- Specify number of passengers.
- View available vehicles and fares.
- Compare different travel options.

### 🎫 Booking Management
- Request seats for available trips.
- Accept or reject booking requests.
- View booking status.
- Manage passenger reservations.
- Prevent seat overbooking.

### ⭐ Trust and Safety
- Driver and vehicle verification support.
- Driver ratings and passenger reviews.
- Booking history.
- User and trip management.

### 🛠️ Admin Features
- Manage users and drivers.
- Review vehicle verification requests.
- Monitor trips and bookings.
- Manage complaints and reviews.

---

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Programming Language | JavaScript |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| API Communication | REST API |
| Version Control | Git and GitHub |

---

## 🎨 Design and Visual Experience

DROPME follows a modern, premium automotive-inspired design approach.

- Dark and premium visual elements.
- Clean and responsive layouts.
- High-quality automotive imagery.
- User-friendly ride search interface.
- Dedicated dashboards for different user roles.
- Consistent design across desktop, tablet, and mobile devices.

---

## 📂 Project Structure

The proposed project structure is:

```text
DROPME/
│
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: Adjust this structure to match the actual files and folders in your repository.*

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/DROPME.git
```

### 2. Navigate to the Project

```bash
cd DROPME
```

### 3. Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Setup the Backend

Open another terminal:

```bash
cd DROPME/backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

*Make sure the environment variable names match your actual backend configuration and that the required scripts exist in `package.json`.*

---

## 🗺️ Future Enhancements

The following features are planned for future development:

- Interactive maps and route visualization.
- Intermediate pickup and drop-off locations.
- Real-time trip tracking.
- Online payment integration.
- Email and SMS notifications.
- In-app communication between drivers and passengers.
- Advanced driver verification.
- Enhanced passenger safety features.
- Mobile application support.

---

## 🔐 Security Considerations

- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based authorization.
- Backend request validation.
- Driver and vehicle ownership checks.
- Secure environment variable management.
- Protection against duplicate bookings and seat overbooking.

---

## 🎯 Project Vision

Our vision is to build a reliable and user-friendly travel-sharing platform that connects people travelling in the same direction.

By making unused passenger seats available to travellers, DROPME aims to improve travel convenience, encourage shared journeys, and reduce individual travel expenses.

**DROPME – Find a ride. Share the journey. Travel smarter.**

---

## 👨‍💻 Author

Developed as a full-stack web development project.

**Project Name:** DROPME  
**Category:** Travel Sharing / Ride Marketplace  
**Repository:** GitHub

---

## 📄 License

This project is currently intended for learning and development purposes. A suitable open-source license can be added before public distribution.
