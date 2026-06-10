-- KB 부동산 가이드 DB 스키마

CREATE DATABASE IF NOT EXISTS kb_realestate DEFAULT CHARACTER SET utf8mb4;
USE kb_realestate;

-- 1. 체크리스트 목록
CREATE TABLE checklist_lists (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        ENUM('월세', '전세', '매매') NOT NULL,
    addr        VARCHAR(200),
    price       VARCHAR(100),
    done        INT DEFAULT 0,
    total       INT DEFAULT 0,
    progress    INT DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 체크 상태
CREATE TABLE check_states (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id     BIGINT NOT NULL,
    item_key    VARCHAR(20) NOT NULL,
    checked     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (list_id) REFERENCES checklist_lists(id) ON DELETE CASCADE
);

-- 3. 대출 추천
CREATE TABLE loan_profiles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    annual_income   BIGINT NOT NULL,
    assets          BIGINT DEFAULT 0,
    debt            BIGINT DEFAULT 0,
    trade_type      ENUM('월세', '전세', '매매') NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);