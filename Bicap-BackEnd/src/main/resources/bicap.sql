DROP DATABASE IF EXISTS bicap;
CREATE DATABASE bicap;

USE bicap;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('ADMIN','FARM_MANAGER','RETAILER','GUEST') NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PACKAGE
CREATE TABLE IF NOT EXISTS package (
    package_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    price       DECIMAL(15,2) NOT NULL,
    duration    INT NOT NULL  -- số ngày
);

-- 3. FARM
CREATE TABLE IF NOT EXISTS farm (
    farm_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    name             VARCHAR(150) NOT NULL,
    address          VARCHAR(255),
    business_license VARCHAR(255),
    owner_name       VARCHAR(100),
    status           ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    CONSTRAINT fk_farm_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 4. SUBSCRIPTION
CREATE TABLE IF NOT EXISTS subscription (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id         BIGINT NOT NULL,
    package_id      BIGINT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          ENUM('ACTIVE','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
    CONSTRAINT fk_sub_farm    FOREIGN KEY (farm_id)    REFERENCES farm(farm_id),
    CONSTRAINT fk_sub_package FOREIGN KEY (package_id) REFERENCES package(package_id)
);

-- 5. RETAILER
CREATE TABLE IF NOT EXISTS retailer (
    retailer_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    name             VARCHAR(150) NOT NULL,
    business_license VARCHAR(255),
    address          VARCHAR(255),
    CONSTRAINT fk_retailer_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 6. FARMING_SEASON
CREATE TABLE IF NOT EXISTS farming_season (
    season_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id          BIGINT NOT NULL,
    name             VARCHAR(150) NOT NULL,
    start_date       DATE,
    end_date         DATE,
    status           ENUM('IN_PROGRESS','EXPORTED','CANCELLED') DEFAULT 'IN_PROGRESS',
    blockchain_hash  VARCHAR(255),
    CONSTRAINT fk_season_farm FOREIGN KEY (farm_id) REFERENCES farm(farm_id)
);

-- 7. PROCESS_LOG
CREATE TABLE IF NOT EXISTS process_log (
    process_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    season_id        BIGINT NOT NULL,
    description      TEXT,
    temperature      DOUBLE,
    humidity         DOUBLE,
    ph               DOUBLE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    blockchain_hash  VARCHAR(255),
    CONSTRAINT fk_process_season FOREIGN KEY (season_id) REFERENCES farming_season(season_id)
);

-- 8. PRODUCT
CREATE TABLE IF NOT EXISTS product (
    product_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    season_id   BIGINT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    quantity    DOUBLE NOT NULL,
    status      ENUM('AVAILABLE','SOLD_OUT','HIDDEN') DEFAULT 'AVAILABLE',
    CONSTRAINT fk_product_season FOREIGN KEY (season_id) REFERENCES farming_season(season_id)
);

-- 9. QR_CODE
CREATE TABLE IF NOT EXISTS qr_code (
    qr_id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id       BIGINT NOT NULL UNIQUE,
    qr_code          VARCHAR(500) NOT NULL,
    blockchain_hash  VARCHAR(255),
    CONSTRAINT fk_qr_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- 10. ORDER
CREATE TABLE IF NOT EXISTS `order` (
    order_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    retailer_id BIGINT NOT NULL,
    farm_id     BIGINT NOT NULL,
    status      ENUM('PENDING','CONFIRMED','REJECTED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_retailer FOREIGN KEY (retailer_id) REFERENCES retailer(retailer_id),
    CONSTRAINT fk_order_farm     FOREIGN KEY (farm_id)     REFERENCES farm(farm_id)
);

-- 11. ORDER_DETAIL
CREATE TABLE IF NOT EXISTS order_detail (
    order_detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    quantity        DOUBLE NOT NULL,
    CONSTRAINT fk_od_order   FOREIGN KEY (order_id)   REFERENCES `order`(order_id),
    CONSTRAINT fk_od_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- 12. SHIPPING
CREATE TABLE IF NOT EXISTS shipping (
    shipping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT NOT NULL UNIQUE,
    shipper_id  BIGINT,
    status      ENUM('PREPARING','IN_TRANSIT','DELIVERED','FAILED') DEFAULT 'PREPARING',
    start_date  DATE,
    end_date    DATE,
    CONSTRAINT fk_shipping_order FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);

-- 13. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    content         TEXT NOT NULL,
    type            VARCHAR(50),
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);