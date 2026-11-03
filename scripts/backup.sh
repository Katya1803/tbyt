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
