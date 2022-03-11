# Creating this dockerfile to make sure that all pip packages are consistent 
FROM python:3.9 

WORKDIR /src
COPY . .

RUN pip3 install -r requirements.txt

CMD ["flask", "run"]
