FROM node:latest as build

RUN mkdir /project
WORKDIR /project

RUN npm install -g @angular/cli

COPY package*.json package-lock*.json ./

RUN npm ci

COPY . .

EXPOSE 8080

ENV NAME front

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "8080", "--public-host", "https://cana-irgaw2zwra-uc.a.run.app","--disable-host-check", "true"]
