# Skaitomanas - Paleidimas

### 1. Paleisti PostgreSQL

```bash
docker-compose up -d
```

### 2. Įdiegti dependencies

```bash
npm install
```

### 3. Paleisti migracijas ir seed duomenis

```bash
npm run migrate
npm run seed
```

### 4. Paleisti serverį

```bash
npm run dev
```

API veiks: http://localhost:3000  
Swagger dokumentacija: http://localhost:3000/docs

## Demo prisijungimo duomenys

**Admin:**

- Email: `admin@skaitomanas.lt`
- Slaptažodis: `password123`

**Autorius:**

- Email: `jonas@example.lt`
- Slaptažodis: `password123`

**Skaitytojas:**

- Email: `petras@example.lt`
- Slaptažodis: `password123`
