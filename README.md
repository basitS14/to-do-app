# Full-Stack Todo App

A production-ready full-stack todo application with secure authentication and authorization.

## Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Bcrypt password hashing** for secure password storage
- **Email validation** and password strength requirements
- **Protected API endpoints** requiring authentication
- **User isolation** - users can only access their own todos

### Todo Management
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Set priority levels (low, medium, high)
- Add descriptions and due dates
- Filter todos by completion status
- Real-time statistics dashboard

### Frontend
- Responsive design with Tailwind CSS
- Clean and modern UI
- Real-time updates
- Form validation
- Toast notifications
- Modal dialogs for editing

## Tech Stack

### Backend
- **Flask** - Python web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **PostgreSQL** - Relational database
- **Bcrypt** - Password hashing

### Frontend
- **HTML5** - Markup
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Client-side logic
- **Font Awesome** - Icons

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

## Installation

### 1. Clone or Download the Project

```bash
cd todo-app
```

### 2. Set Up Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE todo_db;

# Create user (optional)
CREATE USER todo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

# Exit PostgreSQL
\q
```

### 5. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/todo_db

# JWT Configuration (Generate strong random keys!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py

# Security (Generate strong random key!)
SECRET_KEY=your-flask-secret-key-change-this

# CORS
CORS_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
```

**Important:** Change all secret keys to strong random values in production!

Generate secure keys using:
```python
import secrets
print(secrets.token_hex(32))
```

### 6. Initialize Database

The database tables will be automatically created when you first run the application.

### 7. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`



## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### JWT Tokens
- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Tokens are signed with secret key
- Secure token validation on protected endpoints

### Database Security
- Passwords hashed with bcrypt
- SQL injection prevention via ORM
- User data isolation (users can only access their own data)

### Input Validation
- Email format validation
- Username length validation (3-80 characters)
- Title length validation (1-200 characters)
- Priority value validation
- Date format validation

## Production Deployment

### Environment Setup

1. Set `FLASK_ENV=production` in `.env`
2. Use strong, random secret keys
3. Use a production-grade PostgreSQL instance
4. Enable HTTPS
5. Set up proper CORS origins
6. Use a production WSGI server (Gunicorn, uWSGI)

### Example with Gunicorn

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

### Database Migrations

For production, consider using Flask-Migrate for database migrations:

```bash
pip install Flask-Migrate
```

## Testing

### Manual Testing

1. Register a new user at `/register`
2. Login at `/login`
3. Create todos on the dashboard
4. Test filtering, editing, and deleting
5. Test logout functionality

### API Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Create Todo (replace TOKEN with your access token)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test todo","priority":"medium"}'
```

## Project Structure

```
todo-app/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── models.py           # Database models
├── auth_routes.py      # Authentication endpoints
├── todo_routes.py      # Todo CRUD endpoints
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── .env                # Environment variables (create this)
├── README.md           # This file
└── static/             # Frontend files
    ├── index.html      # Main dashboard
    ├── login.html      # Login page
    ├── register.html   # Registration page
    └── app.js          # Frontend JavaScript
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in `.env`
- Ensure database exists: `CREATE DATABASE todo_db;`

### CORS Issues

- Update CORS_ORIGINS in `.env` to include your frontend URL
- Check that Flask-CORS is properly configured

### JWT Token Issues

- Ensure JWT_SECRET_KEY is set in `.env`
- Check token expiration times
- Verify Authorization header format: `Bearer <token>`

### Module Import Errors

- Activate virtual environment
- Install all dependencies: `pip install -r requirements.txt`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Open an issue on the repository

## Future Enhancements

- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Todo categories/tags
- [ ] File attachments
- [ ] Collaborative todos (sharing)
- [ ] Dark mode
- [ ] Mobile app
- [ ] Automated testing suite
- [ ] CI/CD pipeline
