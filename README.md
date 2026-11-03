# Website catalog thiết bị y tế

Xem `CLAUDE.md` (quy ước), `SPEC.md` (chức năng), `DATA_MODEL.md`, `DEPLOY.md`, `PROGRESS.md` (hướng dẫn chạy thử), `DECISIONS.md`.

```
docker compose -f docker-compose.dev.yml up -d   # Postgres để dev
cp .env.example .env                              # rồi sửa DATABASE_URL, mật khẩu admin...
npx prisma migrate dev && npx prisma db seed
npm run dev
```
