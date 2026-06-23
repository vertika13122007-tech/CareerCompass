import os
import resend
from fastapi import HTTPException
from dotenv import load_dotenv

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
    _send_email(email,
                "Please verify you CareerCompass Account",
                html = f"""
                    <h1>Verify Email</h1>

                    <p>Your OTP is {otp}</p>
        """)
    
def welcome_email(
        email:str,
        name: str
):
    _send_email(email,
                "Welcome email",
                html = f"""
                    <h1>Welcome {name} !!</h1>
                    <p>We hope you will succed in your career.</p>
        """)