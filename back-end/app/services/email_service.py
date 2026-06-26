import os
import resend
from fastapi import HTTPException
from dotenv import load_dotenv
from app.utils.email import render_otp_email, render_welcome_email

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def _send_email(
    to:str,
    subject: str,
    html: str,
):
    try:
        response =  resend.Emails.send({
                        "from":"CareerCompass <onboarding@resend.dev>",
                        "to":[to],
                        "subject":subject,
                        "html":html,
                    })
        return response
    except Exception as e:
        print(f"Resend Error :{e}")
        raise HTTPException(
            status_code=500,
            detail="Error occured while sending email."
        )
    

def send_verification_email(
        email:str,
        otp: str
):
    html = render_otp_email(
        title="Verify Your Email",
        heading="Verify Your Email",
        description="Use the OTP below to verify your CareerCompass AI account.",
        otp=otp,
    )

    _send_email(email,
                "Please verify you CareerCompass Account",
                html = html
    )


    
def welcome_email(
        email:str,
        name: str
):
    welcome_html = render_welcome_email(
        name=name,
        dashboard_url="http://localhost:3000/dashboard"
    )

    _send_email(
        to=email,
        subject="🎉 Welcome to CareerCompass AI",
        html=welcome_html,
    )
    

    
def send_password_reset_email(
        email:str,
        otp: str
):
    html = render_otp_email(
        title="Reset Your Password",
        heading="Reset Your Password",
        description="Use the OTP below to reset your CareerCompass AI password.",
        otp=otp,
    )

    _send_email(email,
                "OTP for changing your password",
                html = html
    )