from fastapi import FastAPI

app = FastAPI(
    title="Civic Complaint Resolution Agent"
)


@app.get("/")
def home():
    return {
        "message": "Civic Complaint Resolution Agent API is running"
    }