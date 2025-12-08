# Continue Offers - Promotional Offers Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing promotional offers with role-based access control. Features three user roles: `user`, `admin`, and `super_admin`.

## 🏗️ System Architecture

### User Roles & Permissions

| Role | Create Items | Read Items | Update Items | Delete Items | Manage Users |
|------|--------------|------------|--------------|--------------|--------------|
| **user** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **admin** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **super_admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Default Behavior
- New user registrations automatically get the `user` role (read-only)
- Only `super_admin` can change user roles
- `admin` and `user` cannot change roles

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based route protection
- Secure password hashing with bcrypt
- Token verification and refresh

### Item Management
- Image upload (single image per item)
- Date range selection (start_date, end_date)
- Note/description field
- CRUD operations based on user roles

### User Management (Super Admin Only)
- View all users with pagination
- Change user roles
- Activate/deactivate user accounts
- Bulk operations
- User statistics and analytics

### Frontend Features
- React with TypeScript
- Protected routes based on roles
- Responsive design
- File upload with validation
- Form validation and error handling

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Express Validator** - Input validation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd current-details
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads/
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

## 🚀 Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Run Both with Concurrently (Recommended)

**From root directory:**
```bash
# Install concurrently globally
npm install -g concurrently

# Create package.json in root
cat > package.json << EOF
{
  "name": "rbac-system",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
    "install-all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
EOF

# Install all dependencies
npm run install-all

# Run both backend and frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 👤 Default Users

After setting up, you can create users through registration or create them manually:

### Creating a Super Admin (via MongoDB)

```bash
# Connect to MongoDB
mongo rbac-system

# Create super admin user (password: password123)
db.users.insertOne({
  name: "Super Administrator",
  email: "super@admin.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQSCIi.L.akO",
  role: "super_admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
GET  /api/auth/me          - Get current user profile
PUT  /api/auth/profile     - Update user profile
PUT  /api/auth/password    - Change password
POST /api/auth/verify-token - Verify JWT token
```

### Item Endpoints

```
GET    /api/items           - Get all items (paginated)
GET    /api/items/:id       - Get single item
POST   /api/items           - Create new item (admin/super_admin)
PUT    /api/items/:id       - Update item (admin/super_admin)
DELETE /api/items/:id       - Delete item (admin/super_admin)
GET    /api/items/my/items  - Get items created by current user
```

### User Management Endpoints (Super Admin Only)

```
GET    /api/users              - Get all users (paginated)
GET    /api/users/:id          - Get single user
PUT    /api/users/:id/role     - Update user role
PUT    /api/users/:id/status   - Update user status
GET    /api/users/role/:role   - Get users by role
GET    /api/users/stats/overview - Get user statistics
DELETE /api/users/:id          - Delete user (soft delete)
PUT    /api/users/bulk/roles   - Bulk update user roles
```

## 📁 Project Structure

```
current-details/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   └── users.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   └── .env
└── README.md
```

## 🧪 Testing the API

### Register and Login

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### Access Protected Routes

```bash
# Get items (with token)
curl -X GET http://localhost:5000/api/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create item (admin/super_admin only)
curl -X POST http://localhost:5000/api/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "startDate=2024-01-01" \
  -F "endDate=2024-01-31" \
  -F "note=Sample item" \
  -F "image=@/path/to/image.jpg"
```

## 🔒 Security Features

- **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and number
- **JWT Security**: Secure token generation with expiration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Image type and size validation
- **CORS Protection**: Configured for specific origins

## 🚀 Next Steps

To complete the frontend implementation, you would need to:

1. **Install React Dependencies**:
   ```bash
   cd frontend
   npm install react react-dom react-router-dom axios @types/react @types/react-dom
   ```

2. **Create Remaining Components**:
   - Login/Register forms
   - Dashboard with role-specific views
   - Item management components
   - User management interface

3. **Add Styling**:
   - Implement responsive design
   - Add component-specific styles
   - Consider using a UI library (Material-UI, Tailwind CSS)

The backend is fully functional and ready to use. The frontend structure is set up with TypeScript types, API service, authentication context, and route protection.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using the MERN stack**