from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import random
import smtplib
import os
import hashlib

from email.message import EmailMessage
from datetime import datetime, timedelta

from register_database import create_database, get_connection


# ====================================
# LOAD .ENV
# ====================================

load_dotenv()


# ====================================
# FASTAPI APP
# ====================================

app = FastAPI()


# ====================================
# CORS
# ====================================

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


# ====================================
# CREATE DATABASE
# ====================================

create_database()


# ====================================
# EMAIL SETTINGS
# ====================================

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")


# ====================================
# OTP STORAGE
# ====================================

# Registration OTP
otp_storage = {}

# Forgot-password OTP
forgot_password_otp_storage = {}


# ====================================
# MODELS
# ====================================


class User(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    password: str


class EmailOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class LoginRequest(BaseModel):
    identifier: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str


# ====================================
# PASSWORD HASH
# ====================================


def hash_password(password: str):

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# ====================================
# SEND REGISTRATION EMAIL OTP
# ====================================


@app.post("/send-email-otp")
def send_email_otp(data: EmailOTPRequest):

    if not SENDER_EMAIL or not SENDER_PASSWORD:

        return {
            "success": False,
            "message": "Email configuration is missing"
        }

    email = str(data.email)

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # OTP expires after 5 minutes
    expiry_time = datetime.now() + timedelta(minutes=5)

    # Store OTP
    otp_storage[email] = {
        "otp": otp,
        "expires": expiry_time
    }

    # Create email
    message = EmailMessage()

    message["Subject"] = "QRNISH Email Verification OTP"
    message["From"] = SENDER_EMAIL
    message["To"] = email

    message.set_content(
        f"""
Hello,

Your QRNISH verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Thank you,
QRNISH Team
"""
    )

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as server:

            server.starttls()

            server.login(
                SENDER_EMAIL,
                SENDER_PASSWORD
            )

            server.send_message(message)

        print("Registration OTP sent to:", email)

        return {
            "success": True,
            "message": "OTP sent successfully"
        }

    except Exception as e:

        print("Email error:", e)

        return {
            "success": False,
            "message": "Failed to send OTP"
        }


# ====================================
# VERIFY REGISTRATION EMAIL OTP
# ====================================


@app.post("/verify-email-otp")
def verify_email_otp(data: VerifyOTPRequest):

    email = str(data.email)

    if email not in otp_storage:

        return {
            "success": False,
            "message": "OTP not found. Please request a new OTP."
        }

    stored_data = otp_storage[email]

    # Check expiry
    if datetime.now() > stored_data["expires"]:

        del otp_storage[email]

        return {
            "success": False,
            "message": "OTP expired. Please request a new OTP."
        }

    # Check OTP
    if data.otp != stored_data["otp"]:

        return {
            "success": False,
            "message": "Invalid OTP"
        }

    # OTP verified
    del otp_storage[email]

    return {
        "success": True,
        "message": "Email verified successfully"
    }


# ====================================
# REGISTER
# ====================================


@app.post("/register")
def register(user: User):

    # Minimum password length
    if len(user.password) < 4:

        return {
            "success": False,
            "message": "Password must be at least 4 characters"
        }

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # Check existing email
        cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (str(user.email),)
        )

        existing_user = cursor.fetchone()

        if existing_user:

            return {
                "success": False,
                "message": "Email already registered"
            }

        # Hash password
        hashed_password = hash_password(user.password)

        # Save user
        cursor.execute(
            """
            INSERT INTO users
            (name, mobile, email, password)
            VALUES (?, ?, ?, ?)
            """,
            (
                user.name,
                user.mobile,
                str(user.email),
                hashed_password
            )
        )

        conn.commit()

        print("New user registered:")
        print("Name:", user.name)
        print("Mobile:", user.mobile)
        print("Email:", user.email)

        return {
            "success": True,
            "message": "Registration successful"
        }

    except Exception as e:

        print("Registration error:", e)

        return {
            "success": False,
            "message": "Registration failed"
        }

    finally:

        conn.close()


# ====================================
# LOGIN
# ====================================


@app.post("/login")
def login(data: LoginRequest):

    identifier = data.identifier.strip()
    password = data.password

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # Search by email OR mobile
        cursor.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE email = ? OR mobile = ?
            """,
            (
                identifier,
                identifier
            )
        )

        user = cursor.fetchone()

        # User doesn't exist
        if not user:

            return {
                "success": False,
                "message": "Email or mobile number not registered"
            }

        user_id = user[0]
        name = user[1]
        email = user[2]
        stored_password = user[3]

        # Hash entered password
        entered_password = hash_password(password)

        # Check password
        if entered_password != stored_password:

            return {
                "success": False,
                "message": "Incorrect password"
            }

        print("Login successful:")
        print("User ID:", user_id)
        print("Name:", name)
        print("Email:", email)

        return {
            "success": True,
            "message": "Login successful",
            "name": name,
            "email": email
        }

    finally:

        conn.close()


# ====================================
# FORGOT PASSWORD - SEND OTP
# ====================================


@app.post("/forgot-password/send-otp")
def forgot_password_send_otp(data: ForgotPasswordRequest):

    if not SENDER_EMAIL or not SENDER_PASSWORD:

        return {
            "success": False,
            "message": "Email configuration is missing"
        }

    email = str(data.email)

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # Check whether email exists
        cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        )

        user = cursor.fetchone()

        if not user:

            return {
                "success": False,
                "message": "Email is not registered"
            }

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # OTP expires after 5 minutes
        expiry_time = datetime.now() + timedelta(minutes=5)

        forgot_password_otp_storage[email] = {
            "otp": otp,
            "expires": expiry_time
        }

        # Create email
        message = EmailMessage()

        message["Subject"] = "QRNISH Password Reset OTP"
        message["From"] = SENDER_EMAIL
        message["To"] = email

        message.set_content(
            f"""
Hello,

Your QRNISH password reset OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request a password reset, please ignore this email.

Thank you,
QRNISH Team
"""
        )

        # Send email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:

            server.starttls()

            server.login(
                SENDER_EMAIL,
                SENDER_PASSWORD
            )

            server.send_message(message)

        print("Password reset OTP sent to:", email)

        return {
            "success": True,
            "message": "OTP sent successfully"
        }

    except Exception as e:

        print("Forgot password OTP error:", e)

        return {
            "success": False,
            "message": "Failed to send OTP"
        }

    finally:

        conn.close()


# ====================================
# FORGOT PASSWORD - VERIFY OTP
# ====================================


@app.post("/forgot-password/verify-otp")
def forgot_password_verify_otp(data: VerifyOTPRequest):

    email = str(data.email)

    if email not in forgot_password_otp_storage:

        return {
            "success": False,
            "message": "OTP not found. Please request a new OTP."
        }

    stored_data = forgot_password_otp_storage[email]

    # Check expiry
    if datetime.now() > stored_data["expires"]:

        del forgot_password_otp_storage[email]

        return {
            "success": False,
            "message": "OTP expired. Please request a new OTP."
        }

    # Check OTP
    if data.otp != stored_data["otp"]:

        return {
            "success": False,
            "message": "Invalid OTP"
        }

    return {
        "success": True,
        "message": "OTP verified successfully"
    }


# ====================================
# FORGOT PASSWORD - RESET PASSWORD
# ====================================


@app.post("/forgot-password/reset")
def forgot_password_reset(data: ResetPasswordRequest):

    email = str(data.email)

    # Minimum password length
    if len(data.password) < 4:

        return {
            "success": False,
            "message": "Password must be at least 4 characters"
        }

    # Check OTP exists
    if email not in forgot_password_otp_storage:

        return {
            "success": False,
            "message": "Please verify your OTP first"
        }

    stored_data = forgot_password_otp_storage[email]

    # Check expiry
    if datetime.now() > stored_data["expires"]:

        del forgot_password_otp_storage[email]

        return {
            "success": False,
            "message": "OTP expired. Please request a new OTP."
        }

    # Check OTP
    if data.otp != stored_data["otp"]:

        return {
            "success": False,
            "message": "Invalid OTP"
        }

    # Hash new password
    hashed_password = hash_password(data.password)

    conn = get_connection()

    cursor = conn.cursor()

    try:

        # Update password
        cursor.execute(
            """
            UPDATE users
            SET password = ?
            WHERE email = ?
            """,
            (
                hashed_password,
                email
            )
        )

        conn.commit()

        # Delete used OTP
        del forgot_password_otp_storage[email]

        print("Password reset successful for:", email)

        return {
            "success": True,
            "message": "Password reset successful"
        }

    finally:

        conn.close()