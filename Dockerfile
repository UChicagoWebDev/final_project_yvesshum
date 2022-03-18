# Creating this dockerfile to make sure that graders can run the code
# Note bind port 5000 to local network when running
FROM python:3.9

RUN apt update 
RUN apt install sqlite3

WORKDIR /src
COPY . .

RUN pip3 install -r requirements.txt
RUN export FLASK_ENV=development
RUN export FLASK_APP=app.py
RUN sqlite3 belay.db < 2022-03-11T07:10:47.327Z.sql
EXPOSE 5000
CMD ["flask", "run"]
