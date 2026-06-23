import secrets

def generate_otp(length: int = 6) -> str:
    """
    Generate a secure 6-digit otp 
    """
    minimum = 10 ** (length - 1)
    maximum = 10 ** length

    return str(secrets.randbelow(maximum - minimum) + minimum)

