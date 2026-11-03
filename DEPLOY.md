# DEPLOY — Máy cá nhân + Docker Compose + Cloudflare Tunnel

## Kiến trúc
```
Khách → Cloudflare (HTTPS, cache) → Cloudflare Tunnel → máy nhà
                                                         ├─ web (Next.js :3000)
                                                         ├─ db (Postgres)
                                                         └─ tunnel (cloudflared)
```
Không mở port nào ra Internet. Không cần IP tĩnh.

## Dockerfile
- Multi-stage, base `node:<LTS>-alpine` (hoặc slim nếu sharp gặp lỗi trên alpine).
- `next.config`: `output: "standalone"`.
- Build **không** cần DB.
- Khi container khởi động: `npx prisma migrate deploy && npx prisma db seed && node server.js`
  (seed an toàn khi chạy lại vì chỉ tạo dữ liệu còn thiếu).
- Chạy bằng user non-root. Thư mục `/app/uploads` phải ghi được.

## docker-compose.yml
```yaml
services:
  web:
    build: .
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/medical
      UPLOAD_DIR: /app/uploads
    volumes:
      - ./data/uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: medical
    volumes:
      - ./data/pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10

  tunnel:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel run --token ${CF_TUNNEL_TOKEN}
    depends_on: [web]
```
Ngoài ra có `docker-compose.dev.yml` chỉ chứa service `db` (map port 5432 ra localhost) để dev.

`.env` production thêm:
```
DB_PASSWORD=...
CF_TUNNEL_TOKEN=...
```

## Setup Cloudflare
1. Mua domain, thêm domain vào Cloudflare, đổi nameserver ở nhà đăng ký sang nameserver Cloudflare cung cấp.
2. Cloudflare Zero Trust → Networks → Tunnels → Create tunnel (loại Cloudflared) → copy token vào `CF_TUNNEL_TOKEN`.
3. Public Hostname: `tenmien.com` → Service `HTTP` → `web:3000`. Thêm `www.tenmien.com` rồi tạo Redirect Rule `www` → không `www`.
4. SSL/TLS: chế độ Full. Bật "Always Use HTTPS".
5. Cache Rule: URL path bắt đầu bằng `/uploads/` → Eligible for cache, Edge TTL 1 tháng.
6. Không cache `/admin*`.

## Máy chạy 24/7
- Ưu tiên Linux (Ubuntu Server). Nếu Windows: Docker Desktop bật "Start when you sign in", cấu hình tự đăng nhập, tắt tự restart khi update.
- BIOS: bật **Restore on AC Power Loss = Power On**.
- Nên có UPS.
- Tắt sleep / hibernate.

## Backup (`scripts/backup.sh`)
Chạy cron hằng ngày lúc 2h sáng:
```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TS=$(date +%Y%m%d-%H%M)
mkdir -p backups
docker compose exec -T db pg_dump -U postgres medical | gzip > "backups/db-$TS.sql.gz"
tar -czf "backups/uploads-$TS.tar.gz" -C data uploads
find backups -type f -mtime +14 -delete    # giữ 14 ngày
# Đẩy lên nơi khác (bắt buộc — đừng chỉ để trên máy này), ví dụ rclone:
# rclone copy backups remote:medical-backups
```
Cron: `0 2 * * * /path/to/project/scripts/backup.sh >> /path/to/project/backups/backup.log 2>&1`

## Restore
```bash
gunzip -c backups/db-XXXX.sql.gz | docker compose exec -T db psql -U postgres medical
tar -xzf backups/uploads-XXXX.tar.gz -C data
```

## Cập nhật code
```bash
git pull
docker compose up -d --build
```

## Sau khi lên production
- Đặt `ADMIN_PASSWORD` mạnh trong `.env` trước khi chạy. Đăng nhập `/admin`, điền Thông tin công ty.
- Đổi mật khẩu admin: sửa `.env` → `docker compose up -d` (container `web` sẽ được tạo lại).
- Google Search Console: thêm domain (xác minh bằng DNS trên Cloudflare), submit `https://tenmien.com/sitemap.xml`.
- Tạo Google Business Profile cho công ty.
- Kiểm tra lại quy định pháp lý: kinh doanh thiết bị y tế (phân loại A/B/C/D, số lưu hành) và việc thông báo website thương mại điện tử với Bộ Công Thương nếu cần.
