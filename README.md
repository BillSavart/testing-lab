# Testing Lab

![alt text](project-preview.png)

## Backend

Fastify Server

### Set your environment variable

```bash
cd backend
cp .env.sample .env
```

### Development

Run a mongo container

```bash
docker run -d -p 27017:27017 mongo
```

Install dependencies

```bash
npm install
```

Start development mode

```bash
npm run dev
```

### Run the test

```bash
npm run test
```

## Frontend

React (by vite)

### Development

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start development mode

```bash
npm run dev
```

Visit <http://localhost:5173>

### Run playwright test

```bash
npm run test:e2e
```

If occur some error, make sure you have installed the browser

```bash
# depends on your playwright.config.ts setting
npx playwright install chromium
```

show playwright report

```bash
npx playwright show-report
```

execute end-to-end tests in playwright UI
```bash
npm run test:ui
```