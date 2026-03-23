# AI Interview Agent

An AI-powered interview preparation mentor that helps you practice and improve your interview skills across multiple domains.

## Features

- **Mock Interviews** — AI conducts real-time mock interviews with follow-up questions and detailed feedback
- **Question Bank** — Browse and practice curated interview questions by category and difficulty
- **Resume Analysis** — Upload your resume and get AI-powered feedback on strengths, weaknesses, and likely interview questions
- **Progress Tracking** — Track your practice sessions, scores, and improvement over time with visual charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17, Spring Security, JPA/Hibernate |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| AI | Claude API (Anthropic) |
| Database | H2 (dev) / PostgreSQL (prod) |
| Auth | JWT (JSON Web Tokens) |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- A Claude API key from [Anthropic](https://console.anthropic.com)

### Backend Setup

```bash
cd backend

# Set your Claude API key
export CLAUDE_API_KEY=your-api-key-here

# Run with Maven wrapper or installed Maven
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. An H2 console is available at `http://localhost:8080/h2-console` for development.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:3000` and proxies API requests to the backend.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/start` | Start a new interview session |
| POST | `/api/interviews/{id}/message` | Send a message in an interview |
| POST | `/api/interviews/{id}/end` | End session and get feedback |
| GET | `/api/interviews/sessions` | Get all user sessions |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/public/all` | Get all questions |
| GET | `/api/questions/public/category/{cat}` | Filter by category |
| GET | `/api/questions/{id}/hint` | Get an AI-generated hint |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/analyze` | Upload and analyze a resume |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/stats` | Get user statistics |
| GET | `/api/progress` | Get progress history |

## Interview Categories

- Software Engineering (DSA, coding, architecture)
- System Design
- Data Science / ML
- Product & Business
- Behavioral
- General

## Project Structure

```
ai-interview-agent/
├── backend/
│   ├── src/main/java/com/interviewagent/
│   │   ├── config/          # Security, JWT, CORS, data seeding
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Request/response objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data access layer
│   │   └── service/         # Business logic + Claude API
│   └── src/main/resources/
│       └── application.yml
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # All page components
│   │   ├── services/        # API client
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Your Anthropic Claude API key | — |
| `JWT_SECRET` | Secret key for JWT signing | dev default (change in prod) |
| `DB_HOST` | PostgreSQL host (prod profile) | localhost |
| `DB_PORT` | PostgreSQL port (prod profile) | 5432 |
| `DB_NAME` | Database name (prod profile) | interviewdb |
| `DB_USERNAME` | Database user (prod profile) | postgres |
| `DB_PASSWORD` | Database password (prod profile) | postgres |

## License

MIT
