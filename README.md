# Task Management exercise using NestJS

## Installation

```bash
$ npm install
```

## Running the app

Run the DB first:
```bash
$ docker-compose -f docker/docker-compose.yaml up -d
```

Then the app:
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
