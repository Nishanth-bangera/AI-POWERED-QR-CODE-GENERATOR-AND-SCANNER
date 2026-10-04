

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
# ------------------------------------
# CORS
# ------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------------------
# USER MODEL
# ------------------------------------
class User(BaseModel):
    name: str
    mobile: str
    email: str
    password: str
# ------------------------------------
# REGISTER
# ------------------------------------
@app.post("/register")
def register(user: User):
    print("New user registration:")
    print("Name:", user.name)
    print("Mobile:", user.mobile)
    print("Email:", user.email)
    return {
        "message": "Registration successful"
    }

