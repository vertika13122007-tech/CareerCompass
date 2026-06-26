from jinja2 import Environment, FileSystemLoader
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

templates = Environment(
    loader=FileSystemLoader(BASE_DIR/"templates")
)

def render_otp_email(
        title: str,
        heading: str,
        description: str,
        otp: str,
): 
    template = templates.get_template("emails/otp_email.html")

    return template.render(
        title=title,
        heading=heading,
        description=description,
        otp=otp
    )

def render_welcome_email(
    name: str,
    dashboard_url: str,
):
    template = templates.get_template("emails/welcome_email.html")

    return template.render(
        name=name,
        dashboard_url=dashboard_url,
    )