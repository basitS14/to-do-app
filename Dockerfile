FROM python:3.11-slim

WORKDIR /app

COPY ./backend ./backend
COPY wsgi.py .
COPY requirements.txt .

RUN pip install -r requirements.txt

EXPOSE 5000
ENTRYPOINT ["gunicorn" , "wsgi:app" , "--bind" , "0.0.0.0:5000" ]




