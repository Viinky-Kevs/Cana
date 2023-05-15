FROM node:latest as build

RUN mkdir /project
WORKDIR /project

RUN npm install -g @angular/cli

COPY package*.json package-lock*.json ./

RUN npm ci

COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0"]

