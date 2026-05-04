# BICAP
## 1. Tiêu đề và công nghệ sử dụng
Tiêu đề: Tích hợp Blockchain trong sản xuất nông sản sạch. (Viết tắt: BICAP)

Công nghệ sử dụng: Java Spring Boot, ReactJS, MySQL(TiDB Cloud), VechainThor(TestNet)...
## 2. Cài đặt và chạy ứng dụng
1. Clone repo: ```git clone https://github.com/TranVanVu2502/Java-hk2-2025-2026```

2. Run Back End:
    * ```./mvnw spring-boot:run```

3. Run Front End:
    * ```npm install```
    * ```npm run dev```

## 3. Cấu trúc dự án
Back End:
```
.
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    └── main
        ├── java
        │   └── bicap_backend
        │       ├── BicapBackendApplication.java
        │       ├── config
        │       │   ├── JwtConfig.java
        │       │   ├── OpenApiConfig.java
        │       │   ├── SecurityConfig.java
        │       │   └── WebConfig.java
        │       ├── controller
        │       │   ├── AdminController.java
        │       │   ├── AuthController.java
        │       │   ├── FarmController.java
        │       │   ├── OrderController.java
        │       │   ├── ProductController.java
        │       │   ├── QRController.java
        │       │   ├── RetailerController.java
        │       │   ├── SeasonController.java
        │       │   └── VechainProxyController.java
        │       ├── dto
        │       │   ├── request
        │       │   └── response
        │       ├── enity
        │       │   ├── Farm.java
        │       │   ├── FarmingSeason.java
        │       │   ├── Order.java
        │       │   ├── OrderDetail.java
        │       │   ├── Product.java
        │       │   ├── QRCode.java
        │       │   ├── Retailer.java
        │       │   └── User.java
        │       ├── enums
        │       │   ├── FarmStatus.java
        │       │   ├── OrderStatus.java
        │       │   ├── ProductStatus.java
        │       │   ├── Role.java
        │       │   └── SeasonStatus.java
        │       ├── exception
        │       │   └── GlobalExceptionHandler.java
        │       ├── repository
        │       │   ├── IFarmRepository.java
        │       │   ├── IFarmingSeasonRepository.java
        │       │   ├── IOrderDetailRepository.java
        │       │   ├── IOrderRepository.java
        │       │   ├── IProductRepository.java
        │       │   ├── IQRCodeRepository.java
        │       │   ├── IRetailerRepository.java
        │       │   └── IUserRepository.java
        │       ├── security
        │       │   ├── JwtAuthenticationFilter.java
        │       │   └── JwtTokenProvider.java
        │       └── service
        │           ├── AdminService.java
        │           ├── AuthService.java
        │           ├── CustomUserDetailsService.java
        │           ├── FarmService.java
        │           ├── FileService.java
        │           ├── OrderService.java
        │           ├── ProductService.java
        │           ├── QRService.java
        │           ├── RetailerService.java
        │           └── SeasonService.java
        └── resources
            ├── application.yml
            └── bicap.sql

```
Front End
```text
.
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── App.jsx
│   ├── api
│   │   ├── axios.js
│   │   ├── services.js
│   │   └── vechain.js
│   ├── assets
│   │   ├── banner.png
│   │   ├── hero.png
│   │   └── vite.svg
│   ├── components
│   │   ├── DashboardLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicHeader.jsx
│   ├── context
│   │   ├── AuthContext.jsx
│   │   ├── FarmContext.jsx
│   │   └── OrderContext.jsx
│   ├── index.css
│   ├── main.jsx
│   └── pages
│       ├── admin
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminFarms.jsx
│       │   └── AdminUsers.jsx
│       ├── auth
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── farm
│       │   ├── FarmDashboard.jsx
│       │   ├── FarmManagerDashboard.jsx
│       │   ├── FarmOderDetail.jsx
│       │   ├── FarmOrders.jsx
│       │   ├── FarmProduct.jsx
│       │   ├── FarmProductForm.jsx
│       │   ├── FarmSeasonForm.jsx
│       │   └── FarmSeasons.jsx
│       ├── product
│       │   ├── ProductDetailPage.jsx
│       │   └── ProductsPage.jsx
│       ├── qr
│       │   └── QRLookupPage.jsx
│       └── retailer
│           ├── RetailerDashboard.jsx
│           ├── RetailerOrderDetail.jsx
│           ├── RetailerOrderNew.jsx
│           └── RetailerProfile.jsx
└── vite.config.js
```
