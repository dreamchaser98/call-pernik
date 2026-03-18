# 🏛️ Call Pernik — Контактен център Община Перник

Система за подаване на граждански сигнали за проблеми в град Перник, по модела на [call.sofia.bg](https://call.sofia.bg).

## Функционалности

- **18 категории сигнали** с подтипове (идентични с тези на София)
- **Интерактивна карта** (Leaflet + OpenStreetMap) за посочване на местоположение
- **Търсене по адрес** с автоматичен reverse geocoding
- **Geolocation** — използване на текущото местоположение
- **Детайлна адресна форма** (ж.к., ул., бл., вх., ет., ап.)
- **Drag & drop прикачване** на до 5 файла (макс. 20MB)
- **Валидация** на всички полета (Zod)
- **GDPR съгласие** за обработка на лични данни
- **Стъпков формуляр** (4 стъпки: Категория → Местоположение → Описание → Подател)
- **Статус на сигнали** (нов, в обработка, приключен, отхвърлен)
- **Начална страница** с преглед на сигнали и статистика
- **REST API** за CRUD операции

## Технологичен стек

| Компонент | Технология |
|-----------|------------|
| Frontend  | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend   | Next.js API Routes |
| База данни | SQLite (чрез Prisma ORM) |
| Карта     | Leaflet + OpenStreetMap |
| Валидация | Zod |
| Език      | TypeScript |

## Инсталация

### Предварителни изисквания

- Node.js 18+ 
- npm или yarn

### Стъпки

```bash
# 1. Клониране на проекта
git clone <repo-url>
cd call-pernik

# 2. Инсталиране на зависимости
npm install

# 3. Настройка на база данни
cp .env.example .env
npx prisma generate
npx prisma db push

# 4. Зареждане на начални данни (категории + администратор)
npx tsx prisma/seed.ts

# 5. Стартиране на приложението
npm run dev
```

Приложението ще бъде достъпно на **http://localhost:3000**

### Бърз setup (всичко наведнъж)

```bash
npm run setup
npm run dev
```

## Структура на проекта

```
call-pernik/
├── prisma/
│   ├── schema.prisma      # Модел на базата данни
│   └── seed.ts            # Начални данни (категории, админ)
├── public/
│   └── uploads/           # Качени файлове
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/    # GET /api/categories
│   │   │   ├── signals/       # GET, POST /api/signals
│   │   │   │   └── [id]/      # GET, PATCH /api/signals/:id
│   │   │   └── upload/        # POST /api/upload
│   │   ├── signal/
│   │   │   └── create/        # Страница за подаване на сигнал
│   │   ├── globals.css
│   │   ├── layout.tsx         # Общ layout с хедър/футър
│   │   └── page.tsx           # Начална страница
│   ├── components/
│   │   ├── CategorySelector.tsx  # Избор на категория с търсене
│   │   ├── FileUpload.tsx        # Drag & drop качване на файлове
│   │   └── LocationMap.tsx       # Интерактивна карта
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── signal-code.ts     # Генератор на кодове (PK-2026-XXXXX)
│   │   └── validation.ts      # Zod схеми
│   └── types/
│       └── index.ts           # TypeScript типове
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/categories` | Списък с всички категории и типове |
| GET | `/api/signals?page=1&status=new&search=...` | Списък със сигнали (с пагинация и филтри) |
| POST | `/api/signals` | Създаване на нов сигнал |
| GET | `/api/signals/:id` | Детайли на сигнал |
| PATCH | `/api/signals/:id` | Обновяване статус на сигнал |
| POST | `/api/upload` | Качване на файлове към сигнал |

## Админ акаунт

След seed-ване на базата:

- **Email:** admin@pernik.bg
- **Парола:** admin123

## Надграждане (бъдещо развитие)

- Автентикация и потребителски панел
- Админ панел за управление на сигнали
- Email известия при смяна на статус
- Публична карта с всички сигнали
- Мобилно приложение
- PostgreSQL за production
- Docker контейнеризация

## Лиценз

MIT
