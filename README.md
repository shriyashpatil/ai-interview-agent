# CareerCoach AI

An AI-powered career coaching platform that combines interview preparation, personalised roadmaps, LinkedIn outreach, and an AI coach — all in one place. Built with Spring Boot, React, and the Claude API.

---

## What's Built

### ✅ Core Interview Prep
- **Mock Interviews** — AI conducts real-time mock interviews with follow-up questions and detailed feedback
- **Question Bank** — Browse and practice curated interview questions by category and difficulty
- **Resume Analysis** — Upload your resume and get AI-powered feedback on strengths, weaknesses, and likely interview questions
- **Progress Tracking** — Track practice sessions, scores, and improvement over time

### ✅ Career Roadmap
- **Onboarding wizard** — Collects YoE, domain, goal, current/expected CTC, timeline (3–24 months), WhatsApp number
- **AI-generated roadmap** — Claude creates a week-by-week personalised plan with tasks and resources for each milestone
- **Milestone tracker** — Mark milestones PENDING → IN_PROGRESS → COMPLETED; overall progress bar updates live
- **Auto-completion** — Roadmap status flips to COMPLETED when all milestones are done
- **WhatsApp reminders** — Twilio-powered daily milestone alerts (9 AM) and weekly check-ins (Monday 8 AM)

### ✅ AI Career Coach
- **Context-aware chat** — Coach knows your full profile, roadmap, and milestone progress
- **Roadmap guidance** — Ask about any milestone and get specific, actionable advice
- **Mock interview practice** — Chat-based interview drills with feedback
- **Resource recommendations** — Real courses, platforms, and books suggested based on your goal

### ✅ LinkedIn Agent
- **Profile Optimizer** — Paste your LinkedIn profile → Claude scores it and rewrites headline, summary, experience bullets, and skills with 5 top priority actions
- **Cold Outreach** — Enter a recruiter/hiring manager's name and company → Claude drafts a personalised 300-char LinkedIn message plus a 7-day follow-up version
- **Job Application Tracker** — Track jobs from WISHLIST → APPLIED → SCREENING → INTERVIEW → OFFER/REJECTED
- **AI Cover Letter** — Paste a job description → Claude generates a tailored cover letter + resume tips for that role
- **Follow-Up Dashboard** — Automatically surfaces messages sent 7+ days ago with no reply and applications pending update

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17, Spring Security, JPA/Hibernate |
| Frontend | React 18, Vite, Tailwind CSS |
| AI | Claude API (Anthropic) — `claude-sonnet-4-6` |
| Database | H2 (dev) / PostgreSQL (prod via Railway) |
| Auth | JWT (JSON Web Tokens) |
| Notifications | Twilio WhatsApp Business API |
| Deployment | Railway (backend + frontend as separate services) |
| Frontend serving | nginx with runtime env injection |

---

## Project Structure

```
ai-interview-agent/
├── backend/
│   └── src/main/java/com/interviewagent/
│       ├── config/
│       │   ├── SecurityConfig.java       # CORS, JWT filter chain, route auth
│       │   ├── JwtUtil.java              # Token generation & validation
│       │   ├── JwtAuthFilter.java        # Request-level JWT filter
│       │   └── DataSeeder.java           # Seed question bank on startup
│       ├── controller/
│       │   ├── AuthController.java       # /api/auth/register, /login
│       │   ├── InterviewController.java  # /api/interviews/**
│       │   ├── QuestionController.java   # /api/questions/**
│       │   ├── ResumeController.java     # /api/resume/analyze
│       │   ├── ProgressController.java   # /api/progress/**
│       │   ├── ProfileController.java    # /api/profile  (onboarding)
│       │   ├── RoadmapController.java    # /api/roadmap/** (generate, milestones)
│       │   ├── CoachController.java      # /api/coach/chat
│       │   └── LinkedInController.java   # /api/linkedin/** (15 endpoints)
│       ├── model/
│       │   ├── User.java
│       │   ├── UserProfile.java          # Career profile (domain, goal, CTC, etc.)
│       │   ├── Roadmap.java              # AI-generated roadmap with milestones
│       │   ├── RoadmapMilestone.java     # Per-week milestone with tasks & resources
│       │   ├── InterviewSession.java
│       │   ├── Message.java
│       │   ├── Question.java
│       │   ├── ProgressRecord.java
│       │   ├── LinkedInProfile.java      # Stored LinkedIn optimization results
│       │   ├── OutreachMessage.java      # Cold messages with status tracking
│       │   └── JobApplication.java       # Job pipeline tracker
│       ├── service/
│       │   ├── ClaudeApiService.java     # chat() + generateResponse() + analyzeResume()
│       │   ├── RoadmapGenerationService.java  # Builds prompt, parses JSON, saves roadmap
│       │   ├── LinkedInService.java      # Profile optimize, message gen, cover letter
│       │   ├── WhatsAppService.java      # Twilio WhatsApp send helpers
│       │   ├── RoadmapSchedulerService.java  # @Scheduled cron jobs for reminders
│       │   ├── InterviewService.java
│       │   ├── ResumeService.java
│       │   ├── QuestionBankService.java
│       │   └── ProgressService.java
│       └── dto/                          # Request/response POJOs (validated)
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Dashboard.jsx             # Roadmap widget + quick actions
│       │   ├── Onboarding.jsx            # 4-step profile setup wizard
│       │   ├── Roadmap.jsx               # Visual milestone tracker
│       │   ├── Coach.jsx                 # AI coach chat with roadmap context
│       │   ├── LinkedIn.jsx              # 4-tab LinkedIn agent
│       │   ├── Interview.jsx
│       │   ├── Questions.jsx
│       │   ├── Resume.jsx
│       │   └── Progress.jsx
│       ├── services/
│       │   ├── api.js                    # Axios client + all API functions
│       │   └── linkedinApi.js            # LinkedIn-specific API calls
│       └── components/
│           ├── Navbar.jsx
│           └── ProtectedRoute.jsx
├── frontend/nginx.conf                   # nginx with runtime BACKEND_URL injection
├── backend/railway.json                  # Healthcheck config
├── frontend/railway.json
└── README.md
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Profile & Roadmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get the user's career profile |
| POST | `/api/profile` | Create or update career profile |
| POST | `/api/roadmap/generate` | Generate AI roadmap from profile |
| GET | `/api/roadmap/active` | Get active roadmap with milestones |
| GET | `/api/roadmap` | Get all roadmaps |
| PATCH | `/api/roadmap/milestones/{id}` | Update milestone status |

### AI Coach
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coach/chat` | Chat with the roadmap-aware AI coach |

### LinkedIn Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/linkedin/profile` | Get stored profile optimization |
| POST | `/api/linkedin/profile/optimize` | Analyze & optimize LinkedIn profile with AI |
| GET | `/api/linkedin/messages` | List all outreach messages |
| POST | `/api/linkedin/messages/generate` | Generate personalised cold message |
| PATCH | `/api/linkedin/messages/{id}` | Update message status (SENT, REPLIED, etc.) |
| POST | `/api/linkedin/messages/{id}/follow-up` | Generate AI follow-up message |
| DELETE | `/api/linkedin/messages/{id}` | Delete a message |
| GET | `/api/linkedin/jobs` | List tracked job applications |
| POST | `/api/linkedin/jobs` | Add a job to track |
| PATCH | `/api/linkedin/jobs/{id}` | Update job status / dates / notes |
| POST | `/api/linkedin/jobs/{id}/cover-letter` | Generate cover letter + resume tips |
| DELETE | `/api/linkedin/jobs/{id}` | Remove a job |
| GET | `/api/linkedin/stats` | Dashboard stats (messages, replies, jobs, follow-ups due) |

### Interviews, Questions, Resume, Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/start` | Start a mock interview session |
| POST | `/api/interviews/{id}/message` | Send message in session |
| POST | `/api/interviews/{id}/end` | End session and get feedback |
| GET | `/api/interviews/sessions` | Get all sessions |
| GET | `/api/questions/public/all` | Get all questions |
| GET | `/api/questions/public/category/{cat}` | Filter by category |
| GET | `/api/questions/{id}/hint` | Get AI-generated hint |
| POST | `/api/resume/analyze` | Upload and analyze resume (PDF) |
| GET | `/api/progress/stats` | Get user statistics |
| GET | `/api/progress` | Get progress history |

---

## Environment Variables

### Backend (Railway)
| Variable | Description | Required |
|----------|-------------|----------|
| `CLAUDE_API_KEY` | Anthropic API key | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `DB_HOST` | PostgreSQL host | ✅ prod |
| `DB_PORT` | PostgreSQL port | ✅ prod |
| `DB_NAME` | Database name | ✅ prod |
| `DB_USERNAME` | Database user | ✅ prod |
| `DB_PASSWORD` | Database password | ✅ prod |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | ⚠️ optional (WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | ⚠️ optional (WhatsApp) |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp number e.g. `whatsapp:+14155238886` | ⚠️ optional (WhatsApp) |

### Frontend (Railway build arg)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend public URL e.g. `https://your-backend.up.railway.app/api` |

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- Claude API key from [Anthropic Console](https://console.anthropic.com)

### Backend
```bash
cd backend
export CLAUDE_API_KEY=your-api-key-here
mvn spring-boot:run
# Starts on http://localhost:8080
# H2 console: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8080/api npm run dev
# Starts on http://localhost:5173
```

---

## Deployment (Railway)

Both services are deployed on Railway as separate containers.

**Backend service:**
- Root directory: `backend/`
- Build: `mvn clean package -DskipTests`
- Start: `java -jar target/*.jar`
- Health check: `GET /actuator/health`

**Frontend service:**
- Root directory: `frontend/`
- Build: `npm run build` (with `VITE_API_URL` build arg)
- Start: nginx serving `/dist` on port 80
- Health check: `GET /`

---

## Roadmap — What's Next

### 🔜 High Priority
- [ ] **Email notifications** — Daily / weekly roadmap digest via SendGrid or Resend (fallback when WhatsApp not configured)
- [ ] **Resume version management** — Store multiple resume versions per job application, track which version was sent
- [ ] **AI Interview scheduled from roadmap** — Milestones can auto-schedule mock interview sessions at relevant weeks
- [ ] **Recruiter contact book** — Link cold messages to job applications (connect outreach → application pipeline)

### 🧠 AI Enhancements
- [ ] **Roadmap regeneration with progress context** — When regenerating, Claude takes existing completed milestones into account and only re-plans the remaining timeline
- [ ] **Personalised daily tips** — Morning WhatsApp message with a targeted tip based on the current milestone
- [ ] **Interview question predictor** — Given a job description, predict likely interview questions for that role
- [ ] **Salary negotiation coach** — Dedicated coach mode for offer negotiation conversations

### 🔗 Integrations
- [ ] **Google Calendar sync** — Add interview dates and milestone deadlines to the user's calendar
- [ ] **Naukri / LinkedIn job import** — Paste a job URL and auto-fill company, role, description in the job tracker
- [ ] **GitHub activity import** — Pull recent commits/projects to strengthen experience suggestions in profile optimizer
- [ ] **Slack / Teams notifications** — Alternative to WhatsApp for teams or users without WhatsApp

### 📊 Analytics & Insights
- [ ] **Weekly progress report** — Automated PDF/email summary of the week: milestones completed, messages sent, interviews done
- [ ] **Reply rate analytics** — Track which message styles get the most replies to improve future outreach
- [ ] **Job funnel chart** — Visual Kanban-style pipeline showing jobs at each stage (Wishlist → Offer)
- [ ] **Milestone streak tracking** — Gamification: streaks for consecutive weeks of completing milestones on time

### 🛡️ Platform
- [ ] **Multi-user admin dashboard** — For recruiters or coaches to manage and track multiple candidates
- [ ] **Mobile-responsive polish** — Full Tailwind mobile layout pass for all new pages
- [ ] **Dark mode** — System-preference-aware theme toggle
- [ ] **Exported roadmap PDF** — One-click export of the full roadmap as a shareable PDF

---

## License

MIT
