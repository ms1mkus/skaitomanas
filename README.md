# Skaitomanas – Projekto Ataskaita

**Kauno technologijos universitetas**  
**Informatikos fakultetas**  
**T120B165 Saityno taikomųjų programų projektavimas**

**Studentas:** Martynas Šimkus  
**Dėstytojas:** dr. Tomas Blažauskas  
**Kaunas, 2025**

---

## Turinys

1. [Sprendžiamo uždavinio aprašymas](#1-sprendžiamo-uždavinio-aprašymas)
   - 1.1 [Sistemos paskirtis](#11-sistemos-paskirtis)
   - 1.2 [Funkciniai reikalavimai](#12-funkciniai-reikalavimai)
2. [Sistemos architektūra](#2-sistemos-architektūra)
3. [Naudotojo sąsajos projektas](#3-naudotojo-sąsajos-projektas)
4. [API specifikacija](#4-api-specifikacija)
5. [Išvados](#5-išvados)

---

## 1. Sprendžiamo uždavinio aprašymas

### 1.1. Sistemos paskirtis

Projekto tikslas – sukurti internetinę literatūros skaitymo ir dalinimosi platformą „Skaitomanas", leidžiančią vartotojams nemokamai skaityti, kurti ir dalintis knygomis bei jų skyriais. Sistema skirta trijų tipų naudotojams: svečiams, registruotiems vartotojams ir autoriams.

**Veikimo principas** – platforma susideda iš dviejų pagrindinių dalių:
- **Internetinės aplikacijos (Front-End)** – kurią naudoja vartotojai naršyti ir skaityti turinį
- **Serverio pusės (Back-End)** – kurioje vyksta duomenų apdorojimas, saugojimas ir API prieiga

**Sistemos paskirtis iš vartotojų pusės:**

| Vartotojo tipas | Galimybės |
|-----------------|-----------|
| **Svečias** | Gali naršyti knygų katalogą, peržiūrėti skyrius ir komentarus, bet negali kurti turinio ar komentuoti |
| **Vartotojas** | Gali skaityti knygas, kurti patikusių knygų kolekciją, palikti komentarus ir gauti rekomendacijas pagal skaitymo istoriją |
| **Autorius** | Gali kurti knygas ir jų skyrius, redaguoti turinį, matyti savo kūrinių skaitytojų statistiką |
| **Administratorius** | Gali valdyti visus vartotojus, moderuoti knygas ir komentarus, matyti platformos statistiką |

### 1.2. Funkciniai reikalavimai

**Neregistruotas sistemos naudotojas galės:**
1. Peržiūrėti platformos reprezentacinį puslapį ir knygų katalogą
2. Peržiūrėti knygų skyrius ir jų komentarus
3. Prisijungti prie platformos arba užsiregistruoti

**Registruotas vartotojas galės:**
1. Kurti asmeninę knygų kolekciją (mėgstamiausios)
2. Palikti komentarus prie skyrių
3. Peržiūrėti autorių profilius ir jų kūrinius
4. Matyti savo skaitymo istoriją

**Autorius galės:**
1. Kurti knygas ir jų skyrius
2. Redaguoti savo knygų informaciją
3. Publikuoti arba paslėpti skyrius (juodraščiai)
4. Peržiūrėti savo knygų skaitytojų statistiką

**Administratorius galės:**
1. Valdyti vartotojų roles (paaukštinti į autorių, administratorių)
2. Moderuoti knygas (ištrinti netinkamą turinį)
3. Moderuoti komentarus
4. Matyti platformos statistiką (vartotojų skaičius, knygų skaičius ir kt.)

---

## 2. Sistemos architektūra

### Sistemos sudedamosios dalys

| Komponentas | Technologija |
|-------------|--------------|
| **Kliento pusė (Front-End)** | React + Vite (TypeScript), Mantine UI |
| **Serverio pusė (Back-End)** | Node.js su Fastify, TypeScript |
| **Duomenų bazė** | PostgreSQL |
| **Autentifikacija** | JWT (JSON Web Tokens) |

### UML Deployment diagrama

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["🌐 Web Browser"]
        Mobile["📱 Mobile Browser"]
    end

    subgraph "AWS Cloud"
        subgraph "CDN & Static Hosting"
            CF["☁️ CloudFront CDN"]
            S3["📦 S3 Bucket<br/>(React Build)"]
        end

        subgraph "Application Layer"
            ALB["⚖️ Application Load Balancer"]
            subgraph "ECS Cluster"
                Container1["🐳 Node.js Container 1<br/>(Fastify API)"]
                Container2["🐳 Node.js Container 2<br/>(Fastify API)"]
            end
        end

        subgraph "Data Layer"
            RDS["🗄️ RDS PostgreSQL<br/>(Primary)"]
            RDS_Replica["🗄️ RDS PostgreSQL<br/>(Read Replica)"]
            S3_Uploads["📦 S3 Bucket<br/>(User Uploads)"]
        end
    end

    Browser --> CF
    Mobile --> CF
    CF --> S3
    CF --> ALB
    ALB --> Container1
    ALB --> Container2
    Container1 --> RDS
    Container2 --> RDS
    RDS --> RDS_Replica
    Container1 --> S3_Uploads
    Container2 --> S3_Uploads
```

### Duomenų bazės schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar username UK
        user_role role
        timestamp created_at
        timestamp updated_at
    }

    BOOKS {
        uuid id PK
        varchar title
        text description
        uuid author_id FK
        text cover_image_url
        varchar language
        text[] tags
        book_status status
        timestamp created_at
        timestamp updated_at
    }

    CHAPTERS {
        uuid id PK
        uuid book_id FK
        varchar title
        text content
        int chapter_number
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        uuid chapter_id FK
        uuid user_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }

    COLLECTIONS {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        timestamp created_at
    }

    READING_HISTORY {
        uuid id PK
        uuid user_id FK
        uuid chapter_id FK
        uuid book_id FK
        timestamp last_read_at
        int progress_percentage
    }

    USERS ||--o{ BOOKS : "writes"
    USERS ||--o{ COMMENTS : "creates"
    USERS ||--o{ COLLECTIONS : "has"
    USERS ||--o{ READING_HISTORY : "has"
    BOOKS ||--o{ CHAPTERS : "contains"
    BOOKS ||--o{ COLLECTIONS : "in"
    CHAPTERS ||--o{ COMMENTS : "has"
    CHAPTERS ||--o{ READING_HISTORY : "tracked in"
```

---

## 3. Naudotojo sąsajos projektas

Šiame skyriuje pateikiami projektuojamos sąsajos langų wireframe'ai ir juos atitinkančios realizacijos langų iškarpos.

### 3.1. Pagrindinis puslapis

**Wireframe:**

*[PLACEHOLDER: Įdėkite pagrindinio puslapio wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite pagrindinio puslapio screenshot'ą]*

---

### 3.2. Knygų katalogas

**Wireframe:**

*[PLACEHOLDER: Įdėkite knygų katalogo wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite knygų katalogo screenshot'ą]*

---

### 3.3. Knygos informacijos langas

**Wireframe:**

*[PLACEHOLDER: Įdėkite knygos informacijos wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite knygos informacijos modalinio lango screenshot'ą]*

---

### 3.4. Skyriaus skaitymo langas

**Wireframe:**

*[PLACEHOLDER: Įdėkite skyriaus skaitymo wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite skyriaus skaitymo screenshot'ą]*

---

### 3.5. Prisijungimo forma

**Wireframe:**

*[PLACEHOLDER: Įdėkite prisijungimo formos wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite prisijungimo formos screenshot'ą]*

---

### 3.6. Registracijos forma

**Wireframe:**

*[PLACEHOLDER: Įdėkite registracijos formos wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite registracijos formos screenshot'ą]*

---

### 3.7. Autoriaus valdymo skydelis

**Wireframe:**

*[PLACEHOLDER: Įdėkite autoriaus valdymo skydelio wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite autoriaus valdymo skydelio screenshot'ą]*

---

### 3.8. Skyrių redagavimas

**Wireframe:**

*[PLACEHOLDER: Įdėkite skyrių redagavimo wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite skyrių redagavimo screenshot'ą]*

---

### 3.9. Vartotojo kolekcija

**Wireframe:**

*[PLACEHOLDER: Įdėkite kolekcijos wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite kolekcijos screenshot'ą]*

---

### 3.10. Skaitymo istorija

**Wireframe:**

*[PLACEHOLDER: Įdėkite skaitymo istorijos wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite skaitymo istorijos screenshot'ą]*

---

### 3.11. Administratoriaus skydelis

**Wireframe:**

*[PLACEHOLDER: Įdėkite admin skydelio wireframe paveikslėlį]*

**Realizacija:**

*[PLACEHOLDER: Įdėkite admin skydelio screenshot'ą]*

---

## 4. API specifikacija

Pilna API specifikacija pateikta [api-spec.yaml](./api-spec.yaml) faile OpenAPI 3.0 formatu.

### Interaktyvi dokumentacija

| Nuoroda | Aprašymas |
|---------|-----------|
| [http://localhost:3000/api-docs.html](http://localhost:3000/api-docs.html) | Swagger UI su visa API dokumentacija |
| [http://localhost:3000/api-spec.yaml](http://localhost:3000/api-spec.yaml) | OpenAPI specifikacijos failas (YAML) |
| [http://localhost:3000/docs](http://localhost:3000/docs) | Auto-generuota Fastify Swagger dokumentacija |

### API santrauka

| Kategorija | Endpoint'ai | Aprašymas |
|------------|-------------|-----------|
| **Auth** | 5 | Registracija, prisijungimas, tokenų atnaujinimas |
| **Books** | 7 | Knygų CRUD, paieška, rekomendacijos |
| **Chapters** | 5 | Skyrių CRUD, skaitymas |
| **Comments** | 5 | Komentarų CRUD |
| **Collections** | 3 | Mėgstamiausių knygų valdymas |
| **Stats** | 2 | Autoriaus statistika, skaitymo istorija |
| **Admin** | 8 | Vartotojų, knygų, komentarų moderavimas |
| **Upload** | 1 | Paveikslėlių įkėlimas |

### Panaudojimo pavyzdžiai

#### 4.1. Vartotojo registracija

**Užklausa:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "naujas@example.com",
  "password": "saugusSlaptazodis123",
  "username": "naujas_vartotojas",
  "role": "user"
}
```

**Atsakymas (201 Created):**
```json
{
  "success": true,
  "message": "Registracija sėkminga",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "naujas@example.com",
      "username": "naujas_vartotojas",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 201 | Vartotojas sėkmingai sukurtas |
| 400 | Neteisingi duomenys (el. paštas užimtas, per trumpas slaptažodis) |
| 500 | Serverio klaida |

---

#### 4.2. Prisijungimas

**Užklausa:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "vartotojas@example.com",
  "password": "slaptazodis123"
}
```

**Atsakymas (200 OK):**
```json
{
  "success": true,
  "message": "Prisijungimas sėkmingas",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "vartotojas@example.com",
      "username": "skaitytojas123",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 200 | Prisijungimas sėkmingas |
| 401 | Neteisingas el. paštas arba slaptažodis |
| 500 | Serverio klaida |

---

#### 4.3. Knygų sąrašo gavimas

**Užklausa:**
```http
GET /api/books?tag=fantastika&language=lt&limit=10&offset=0
```

**Atsakymas (200 OK):**
```json
{
  "success": true,
  "message": "Knygos rastos",
  "data": {
    "books": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Lietuvos pasakos",
        "description": "Rinkinys tradicinių lietuvių liaudies pasakų",
        "author_id": "660e8400-e29b-41d4-a716-446655440001",
        "author_username": "jonas_rašytojas",
        "cover_image_url": "https://example.com/cover.jpg",
        "language": "lt",
        "tags": ["pasakos", "liaudies"],
        "status": "published",
        "created_at": "2025-01-10T14:00:00Z"
      }
    ],
    "total": 42,
    "limit": 10,
    "offset": 0
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 200 | Knygos sėkmingai grąžintos |
| 500 | Serverio klaida |

---

#### 4.4. Naujos knygos sukūrimas

**Užklausa:**
```http
POST /api/books
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Mano nauja knyga",
  "description": "Įdomi istorija apie nuotykius",
  "language": "lt",
  "tags": ["nuotykiai", "fantastika"],
  "status": "draft"
}
```

**Atsakymas (201 Created):**
```json
{
  "success": true,
  "message": "Knyga sukurta",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Mano nauja knyga",
    "description": "Įdomi istorija apie nuotykius",
    "author_id": "550e8400-e29b-41d4-a716-446655440000",
    "language": "lt",
    "tags": ["nuotykiai", "fantastika"],
    "status": "draft",
    "created_at": "2025-01-20T09:00:00Z"
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 201 | Knyga sukurta |
| 400 | Neteisingi duomenys |
| 401 | Neautorizuota (reikia prisijungti) |
| 403 | Draudžiama (tik autoriams) |

---

#### 4.5. Skyriaus skaitymas

**Užklausa:**
```http
GET /api/books/550e8400-e29b-41d4-a716-446655440000/chapters/770e8400-e29b-41d4-a716-446655440002
```

**Atsakymas (200 OK):**
```json
{
  "success": true,
  "message": "Skyrius rastas",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "book_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Eglė žalčių karalienė",
    "content": "Seniai seniai, prie Baltijos jūros, gyveno žvejys su savo trimis dukromis...",
    "chapter_number": 1,
    "word_count": 3500,
    "is_published": true,
    "book_title": "Lietuvos pasakos"
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 200 | Skyrius rastas |
| 404 | Skyrius arba knyga nerasta |

---

#### 4.6. Komentaro pridėjimas

**Užklausa:**
```http
POST /api/chapters/770e8400-e29b-41d4-a716-446655440002/comments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Puikus skyrius, laukiu tęsinio!"
}
```

**Atsakymas (201 Created):**
```json
{
  "success": true,
  "message": "Komentaras pridėtas",
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "chapter_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Puikus skyrius, laukiu tęsinio!",
    "created_at": "2025-01-20T11:00:00Z"
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 201 | Komentaras pridėtas |
| 400 | Tuščias komentaras |
| 401 | Neautorizuota |
| 404 | Skyrius nerastas |

---

#### 4.7. Pridėjimas į kolekciją

**Užklausa:**
```http
POST /api/users/550e8400-e29b-41d4-a716-446655440000/collections
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "book_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Atsakymas (201 Created):**
```json
{
  "success": true,
  "message": "Pridėta į kolekciją",
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440010",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "book_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 201 | Knyga pridėta į kolekciją |
| 401 | Neautorizuota |
| 404 | Knyga nerasta |

---

#### 4.8. Autoriaus statistika

**Užklausa:**
```http
GET /api/authors/660e8400-e29b-41d4-a716-446655440001/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Atsakymas (200 OK):**
```json
{
  "success": true,
  "message": "Statistika",
  "data": {
    "total_books": 5,
    "total_chapters": 25,
    "total_readers": 150,
    "total_comments": 42,
    "most_read_book": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Lietuvos pasakos",
      "read_count": 89
    }
  }
}
```

**Galimi atsako kodai:**
| Kodas | Aprašymas |
|-------|-----------|
| 200 | Statistika grąžinta |
| 401 | Neautorizuota |
| 403 | Draudžiama (ne savo statistika) |

---

## 5. Išvados

Projekto „Skaitomanas" kūrimo metu buvo sėkmingai realizuota internetinė literatūros skaitymo ir dalinimosi platforma, atitinkanti visus iškeltus funkcinius reikalavimus.

### Pasiekti tikslai:

1. **Pilnavertė REST API** – sukurta 36 endpoint'ų API su JWT autentifikacija, role-based prieigos kontrole ir išsamia OpenAPI dokumentacija.

2. **Moderni naudotojo sąsaja** – React aplikacija su Mantine UI komponentų biblioteka, palaikanti tamsią temą ir responsive dizainą.

3. **Hierarchinė duomenų struktūra** – realizuotas Books → Chapters → Comments hierarchinis modelis su tinkamais ryšiais ir CASCADE ištrynimo taisyklėmis.

4. **Rolėmis pagrįsta prieiga** – sistema palaiko keturis vartotojų tipus (svečias, vartotojas, autorius, administratorius) su skirtingomis teisėmis.

5. **Papildomos funkcijos:**
   - Autoriaus statistikos skydelis
   - Vartotojo skaitymo istorija
   - Knygų kolekcijos (mėgstamiausios)
   - Administratoriaus moderavimo įrankiai
   - Paveikslėlių įkėlimo funkcionalumas

### Naudotos technologijos:

| Sritis | Technologija |
|--------|--------------|
| Frontend | React, Vite, TypeScript, Mantine UI |
| Backend | Node.js, Fastify, TypeScript |
| Duomenų bazė | PostgreSQL |
| Autentifikacija | JWT (access + refresh tokens) |
| Validacija | Zod |
| Dokumentacija | OpenAPI 3.0 / Swagger |
| Deployment | AWS (S3, CloudFront, ECS, RDS) |

### Galimi patobulinimai ateityje:

- Knygų paieška su pilno teksto paieška (full-text search)
- Socialinės funkcijos (sekti autorius, dalintis knygomis)
- Skaitymo progreso sinchronizacija tarp įrenginių
- Push pranešimai apie naujus skyrius
- Knygų vertinimo sistema (žvaigždutės/reitingai)
- Audioknygų palaikymas

---

*© 2025 Martynas Šimkus. Kauno technologijos universitetas.*
