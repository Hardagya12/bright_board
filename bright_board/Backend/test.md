# API Testing Guide

## 1. Institute Management

### Create Institute
```http
POST http://localhost:3000/institutes
Content-Type: application/json

{
  "name": "Tech Academy",
  "address": "123 Education Street",
  "contactNumber": "1234567890",
  "email": "tech@academy.com",
  "password": "securepass123"
}

Response: Returns instituteId (e.g., INST0001) and token
```

### Institute Login
```http
POST http://localhost:3000/institutes/login
Content-Type: application/json

{
  "email": "tech@academy.com",
  "password": "securepass123"
}

Response: Returns token
```

### Get All Institutes
```http
GET http://localhost:3000/institutes
```

### Get Institute Details
```http
GET http://localhost:3000/institutes/INST0001
Authorization: Bearer <token>
```

## 2. Course Management

### Create Course
```http
POST http://localhost:3000/institutes/INST0001/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Full Stack Development",
  "description": "Complete web development course",
  "duration": "6 months"
}

Response: Returns courseId (e.g., COURSE0001)
```

## 3. Batch Management

### Create Batch
```http
POST http://localhost:3000/institutes/INST0001/batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "FSW Batch 2024",
  "description": "Full Stack Web Development Batch",
  "startDate": "2024-03-01",
  "endDate": "2024-08-31",
  "courseId": "COURSE0001"
}

Response: Returns batchId (e.g., BATCH0001)
```

### Get All Batches
```http
GET http://localhost:3000/institutes/INST0001/batches
Authorization: Bearer <token>
```

## 4. Student Management

### Create Student (By Institute)
```http
POST http://localhost:3000/institutes/INST0001/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "student123",
  "contactNumber": "9876543210",
  "address": "456 Student Lane"
}

Response: Returns studentId (e.g., STU0001)
```

### Student Self-Registration
```http
POST http://localhost:3000/students/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "student123",
  "instituteId": "INST0001",
  "contactNumber": "9876543211",
  "address": "789 Student Avenue"
}
```

### Student Login
```http
POST http://localhost:3000/students/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "student123"
}
```

## 5. Batch-Student Operations

### Add Student to Batch
```http
POST http://localhost:3000/institutes/INST0001/batches/BATCH0001/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "STU0001"
}
```

### Get Batch Students
```http
GET http://localhost:3000/institutes/INST0001/batches/BATCH0001/students
Authorization: Bearer <token>
```

### Remove Student from Batch
```http
DELETE http://localhost:3000/institutes/INST0001/batches/BATCH0001/students/STU0001
Authorization: Bearer <token>
```

## Testing Flow

1. Create an institute
2. Login as institute
3. Create a course
4. Create a batch
5. Add students (either through institute or self-registration)
6. Add students to batch
7. View batch details with enrolled students

## Sample cURL Commands

### Create Institute
```bash
curl -X POST http://localhost:3000/institutes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Academy",
    "address": "123 Education Street",
    "contactNumber": "1234567890",
    "email": "tech@academy.com",
    "password": "securepass123"
  }'
```

### Create Course
```bash
curl -X POST http://localhost:3000/institutes/INST0001/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Full Stack Development",
    "description": "Complete web development course",
    "duration": "6 months"
  }'
```

### Create Batch
```bash
curl -X POST http://localhost:3000/institutes/INST0001/batches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "FSW Batch 2024",
    "description": "Full Stack Web Development Batch",
    "startDate": "2024-03-01",
    "endDate": "2024-08-31",
    "courseId": "COURSE0001"
  }'
```