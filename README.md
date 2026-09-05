CivicResolve

Agentic AI for Intelligent Civic Complaint Resolution

CivicResolve is a full-stack agentic AI platform that helps automate civic complaint analysis, prioritization, routing, SLA tracking, human review, escalation, and auditability.

Live Demo: https://civic-complaint-agent.vercel.app/

Overview

Traditional civic complaint systems often depend on manual triaging: someone must read every complaint, understand the issue, decide how urgent it is, identify the responsible department, and then forward it.

This can lead to:

Delayed complaint handling

Incorrect department routing

Repetitive manual work

Poor visibility into unresolved complaints

Limited accountability when deadlines are missed

CivicResolve turns this into a controlled AI-assisted workflow.

A citizen submits a complaint, and the system analyzes it using Gemini, determines the issue category and priority, calculates a confidence score, routes the complaint to the appropriate department, assigns an SLA, and tracks the complaint throughout its lifecycle.

When the AI is uncertain, CivicResolve does not blindly automate the decision. The complaint is sent for human review.

Core Workflow

Citizen submits complaint
        ↓
Complaint stored
        ↓
Historical complaint context loaded
        ↓
Gemini analyzes complaint
        ↓
Category + Priority + Confidence + Rationale
        ↓
Confidence Gate
      ↙             ↘
High confidence     Low confidence
      ↓             ↓
Auto workflow       Manual Review Required
      ↓             ↓
Department routing  Human confirms/corrects
        \           /
         ↓         ↓
           SLA assigned
                ↓
         Complaint monitored
                ↓
         SLA breach detected
                ↓
            Escalation
                ↓
        Audit history updated

Key Features

AI Complaint Understanding

CivicResolve uses Gemini to analyze natural-language civic complaints and generate:

Complaint category

Priority / urgency

Confidence score

Decision rationale

The AI focuses on interpretation and reasoning, while important operational actions remain controlled by backend rules.

Confidence-Based Human Review

AI decisions are not trusted blindly.

When confidence is below the configured threshold, the complaint is moved to:

MANUAL_REVIEW_REQUIRED

An administrator can then inspect the AI recommendation and confirm or correct the category and priority before the complaint continues.

Controlled Department Routing

The language model does not freely choose arbitrary operational actions.

Complaint categories are mapped to controlled departments through backend application logic, helping make routing predictable and auditable.

SLA Management

Every complaint receives an SLA deadline based on its priority.

The system tracks unresolved complaints and continuously checks whether their SLA has been breached.

Automatic Escalation

A scheduled backend process monitors active complaints.

If an unresolved complaint exceeds its SLA, CivicResolve automatically creates an escalation and surfaces the case to administrators.

Historical Decision Context

CivicResolve can use previous complaint decisions and human-corrected outcomes as historical context for similar future complaints.

This allows the workflow to benefit from earlier decisions without claiming that the underlying model is automatically retrained.

Role-Based Dashboards

The platform supports three user roles:

Citizen — create complaints and track progress

Department Admin — manage complaints assigned to a department and review uncertain AI decisions

Super Admin — oversee departments, complaints, escalations, users, and system activity

Complaint Evidence & Location

Citizens can provide:

Complaint description

Address / location information

Geographic coordinates

Supporting image evidence

Audit History

Important events are recorded so the complaint lifecycle remains traceable.

Examples include:

Complaint submission

AI analysis

Assignment

Human review

Status changes

Escalation

Resolution-related workflow events

In-App Notifications

The system generates notifications for important complaint workflow events so relevant users can stay aware of changes and escalations.

Why Agentic AI?

CivicResolve is not simply:

User input → LLM response

The AI output participates in a larger controlled workflow.

LangGraph is used to manage workflow state and conditional paths such as:

Analyze complaint
        ↓
Check confidence
   ↙            ↘
Continue        Human review

The overall system combines:

LLM-based understanding

Stateful workflow orchestration

Conditional branching

Historical context

Human-in-the-loop safeguards

Deterministic routing rules

SLA monitoring

Automated escalation

Auditability

This creates an AI-assisted operational workflow rather than a standalone chatbot.

Architecture

flowchart TD
    U[Citizen / Department Admin / Super Admin] --> F[React Frontend]
    F --> B[FastAPI Backend]
    B --> DB[(PostgreSQL)]

    B --> LG[LangGraph Workflow]
    LG --> M[Load Historical Context]
    M --> G[Gemini Analysis]

    G --> C{Confidence Gate}

    C -->|High Confidence| A[Automatic Workflow]
    C -->|Low Confidence| H[Human Review]

    H --> R[Confirmed / Corrected Decision]
    A --> D[Controlled Department Routing]
    R --> D

    D --> S[SLA Assignment]
    S --> DB

    DB --> MON[SLA Monitoring]
    MON --> E[Escalation]
    E --> N[Notifications]
    E --> AH[Audit History]

Technology Stack

Frontend

React

Vite

React Router

Backend

Python

FastAPI

SQLAlchemy

Pydantic

APScheduler

Database

PostgreSQL

AI / Agentic Workflow

Google Gemini

LangGraph

LangChain Google GenAI integration

Authentication & Security

JWT authentication

Bcrypt password hashing

Role-based authorization

Media & Location

Cloudinary

Geolocation / address handling

Deployment

Frontend: Vercel

Backend: Render

Database: PostgreSQL

Project Structure

civic-complaint-agent/
│
├── backend/
│   ├── agent/
│   │   ├── graph.py
│   │   ├── memory.py
│   │   ├── nodes.py
│   │   ├── prompts.py
│   │   ├── state.py
│   │   └── tools.py
│   │
│   ├── jobs/
│   │   └── escalation_jobs.py
│   │
│   ├── services/
│   │   ├── location_service.py
│   │   ├── notification_service.py
│   │   └── sla_service.py
│   │
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md

Running Locally

1. Clone the repository

git clone https://github.com/suhail-husain123/civic-complaint-agent.git
cd civic-complaint-agent

2. Backend setup

cd backend

python -m venv venv

Activate the virtual environment.

Windows:

venv\Scripts\activate

macOS / Linux:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Create a backend/.env file:

DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the backend:

uvicorn main:app --reload

The API will normally run at:

http://127.0.0.1:8000

3. Frontend setup

Open another terminal:

cd frontend
npm install

Create frontend/.env:

VITE_API_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

Open the local URL displayed by Vite.

Security Notes

Passwords are stored as bcrypt hashes.

Authentication uses JWT access tokens.

Protected endpoints enforce role-based authorization.

Secrets and API keys are loaded from environment variables and should never be committed to Git.

Current Scope

CivicResolve currently focuses on:

AI-assisted complaint triage

Priority identification

Controlled department routing

Confidence-based human review

SLA assignment

SLA monitoring and escalation

Complaint lifecycle tracking

Role-based administration

Auditability

Historical complaint context

Image and location evidence

Future Improvements

Potential future extensions include:

Semantic duplicate complaint detection

Geographic complaint clustering

Larger AI evaluation datasets

Model performance monitoring

Advanced municipal analytics

Multi-language complaint understanding

Resolution verification using image analysis

Live Application

CivicResolve:
https://civic-complaint-agent.vercel.app/

Author

Suhail Husain

B.Tech — Artificial Intelligence & Data Science

GitHub: https://github.com/suhail-husain123

CivicResolve is designed around a simple principle: use AI where reasoning helps, use deterministic rules where reliability matters, and keep humans in the loop when confidence is not sufficient.