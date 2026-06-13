# Fertilizer Shop Credit & Crop Management System

Full-stack ERP-style application for fertilizer shop credit tracking, stock control, interest calculation, crop settlement, and reporting.

## Stack
- Frontend: Angular 17 + Angular Material
- Backend: Spring Boot 3 + Spring Security + JWT
- Database: MySQL 8

## Project Structure
- `backend/` Spring Boot REST API
- `frontend/` Angular application
- `database/schema.sql` MySQL schema + sample records

## Run Instructions

### 1) Database
```bash
mysql -u root -p < database/schema.sql
```

### 2) Backend
Update `backend/src/main/resources/application.yml` for DB credentials.

```bash
cd backend
mvn spring-boot:run
```

API base URL: `http://localhost:8080`

Default users:
- `admin / admin123`
- `farmer / farmer123`

### 3) Frontend
```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:4200`

## Main Endpoints
- `POST /auth/login`
- `GET/POST/PUT/DELETE /farmers`
- `GET/POST /categories`
- `GET/POST /products`
- `GET /stock`, `POST /stock/{id}/in`, `GET /stock/movements`
- `POST /credit`, `GET /credit/farmer/{farmerId}`
- `POST /interest/calculate`, `GET /interest/farmer/{farmerId}`
- `POST /settlement`, `GET /settlement/farmer/{farmerId}`
- `GET /reports/dashboard`

## Key Business Logic
- Voucher supports multiple cash + product line items in one transaction.
- Product stock is auto-deducted during credit voucher creation.
- Farmer balance auto-updates with every voucher.
- Settlement computes net payout:
  `Net Payout = Crop Value - (Credit + Interest)`
- Receipt details returned in settlement response for printing.
