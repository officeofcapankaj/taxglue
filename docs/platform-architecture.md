# TaxGlue Platform Architecture

## Overview

TaxGlue is designed as a modular, cloud-native tax compliance platform for Indian tax professionals. The architecture follows a **modular monolith** approach that can evolve into microservices as needed.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  Mobile App  │  │  API Client  │              │
│  │   (React)    │  │   (React     │  │   (REST)     │              │
│  │              │  │    Native)    │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NGINX / Traefik                            │  │
│  │  • Rate Limiting  • SSL/TLS  • Load Balancing  • Caching    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    REST API Server                            │  │
│  │  • Flask/Python  • Express/Node.js  • Go Services           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │   Auth   │ │   TDS    │ │   GST    │ │   Bill    │ │  User  │  │
│  │ Service  │ │ Service  │ │ Service  │ │  Service  │ │ Service│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ PostgreSQL   │  │    Redis     │  │    S3/MinIO  │              │
│  │  (Primary)   │  │   (Cache)    │  │  (Documents) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │  TRACES  │ │   GSTN   │ │  NSDL    │ │   Bank   │              │
│  │   API    │ │   API    │ │   API    │ │  APIs    │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Authentication Service
- JWT-based authentication
- OAuth2 support (Google, Microsoft)
- Multi-factor authentication
- Session management

### 2. TDS Engine
- Section management (192, 194C, 194J, etc.)
- PAN validation
- Rate lookup engine
- Challan reconciliation
- Interest calculation

### 3. GST Module
- GSTIN management
- Invoice tracking
- GSTR preparation
- Input tax credit

### 4. Billing Service
- Subscription management
- Usage tracking
- Invoice generation
- Payment integration

### 5. User Management
- Multi-tenant support
- Role-based access control
- Organization management

## Database Schema Design

### Core Tables

```sql
-- Organizations (Multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- CA_FIRM, SME, ENTERPRISE
    subscription_tier VARCHAR(50),
    subscription_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50), -- ADMIN, CA, STAFF, CLIENT
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Deductors (TDS Deductor Management)
CREATE TABLE deductors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    tan VARCHAR(10),
    name VARCHAR(255),
    gstin VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dedutees
CREATE TABLE deductees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    deductoor_id UUID REFERENCES deductors(id),
    pan VARCHAR(10),
    name VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TDS Transactions
CREATE TABLE tds_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    deductoor_id UUID REFERENCES deductors(id),
    deductee_id UUID REFERENCES deductees(id),
    section VARCHAR(10),
    amount DECIMAL(15,2),
    tds_rate DECIMAL(5,2),
    tds_amount DECIMAL(15,2),
    payment_date DATE,
    transaction_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- TDS Challans
CREATE TABLE tds_challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    bsr_code VARCHAR(10),
    challan_date DATE,
    challan_amount DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- TDS Returns
CREATE TABLE tds_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    quarter VARCHAR(10),
    form_type VARCHAR(10), -- 24Q, 26Q, 27Q
    fy VARCHAR(10),
    status VARCHAR(50),
    file_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- GST Invoices
CREATE TABLE gst_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    invoice_number VARCHAR(50),
    invoice_date DATE,
    gstin VARCHAR(15),
    invoice_type VARCHAR(20), -- B2B, B2C, EXPORT
    taxable_value DECIMAL(15,2),
    cgst DECIMAL(15,2),
    sgst DECIMAL(15,2),
    igst DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Layer Design

### REST API Endpoints

```
Authentication:
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

Organizations:
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:id

Users:
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

TDS:
GET    /api/v1/tds/deductors
POST   /api/v1/tds/deductors
GET    /api/v1/tds/deductees
POST   /api/v1/tds/deductees
GET    /api/v1/tds/transactions
POST   /api/v1/tds/transactions
GET    /api/v1/tds/challans
POST   /api/v1/tds/challans
GET    /api/v1/tds/returns
POST   /api/v1/tds/returns/:id/generate
GET    /api/v1/tds/returns/:id/download

GST:
GET    /api/v1/gst/invoices
POST   /api/v1/gst/invoices
GET    /api/v1/gst/summary
GET    /api/v1/gst/gstr1
GET    /api/v1/gst/gstr3b

Billing:
GET    /api/v1/billing/subscriptions
POST   /api/v1/billing/subscriptions
GET    /api/v1/billing/invoices

Reports:
GET    /api/v1/reports/tds-summary
GET    /api/v1/reports/gst-liability
GET    /api/v1/reports/compliance-calendar
```

## Event System

Using a message queue for async operations:

```javascript
// Event Types
const EVENTS = {
    TDS_CREATED: 'tds.created',
    TDS_UPDATED: 'tds.updated',
    TDS_DELETED: 'tds.deleted',
    GST_INVOICE_CREATED: 'gst.invoice.created',
    RETURN_GENERATED: 'return.generated',
    PAYMENT_RECEIVED: 'payment.received',
    USER_CREATED: 'user.created'
};
```

## Job Queue

For long-running tasks:
- TDS return generation
- Bulk form processing
- Document generation
- Email notifications

## Caching Strategy

- **Redis** for session management
- **Redis** for frequently accessed data (tax rates, PAN validation cache)
- **CDN** for static assets

## Security Architecture

1. **Authentication**: JWT with short-lived access tokens, refresh tokens
2. **Authorization**: RBAC with organization-level isolation
3. **Data Encryption**: TLS in transit, encrypted fields at rest
4. **API Security**: Rate limiting, IP whitelisting
5. **Audit Logging**: All sensitive actions logged

## Infrastructure

### Docker Compose Setup

```yaml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/taxglue
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=taxglue
    volumes:
      - postgres_data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend API | Python (FastAPI) / Flask |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Queue | RabbitMQ / Celery |
| Search | Elasticsearch |
| File Storage | S3 / MinIO |
| Container | Docker |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API servers behind load balancer
2. **Database**: Read replicas for reporting queries
3. **Caching**: Redis cluster for high availability
4. **File Storage**: S3-compatible object storage
5. **Async Processing**: Celery workers for heavy tasks

## Development Phases

### Phase 1: Foundation
- [x] Repository Analysis
- [ ] Platform Architecture
- [ ] Database Schema Design
- [ ] Authentication Service

### Phase 2: Core Features
- [ ] TDS Engine
- [ ] GST Module
- [ ] Basic Reporting

### Phase 3: Advanced Features
- [ ] AI Automation
- [ ] Multi-tenancy
- [ ] Billing System

### Phase 4: Production Readiness
- [ ] Security Audit
- [ ] Performance Testing
- [ ] CI/CD Pipeline
- [ ] Documentation
