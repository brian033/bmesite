# Deployment doc

## 1. clone the repo

```bash
git clone https://github.com/brian033/bmesite.git
git checkout [branch you want to deploy]
```

## 2. create files and folders

### 1. Create folders

```bash
# create volume mount points
cd bmesite
mkdir uploads
mkdir db
```

### 2. Create .env file

#### Template:

```txt
# DB datas
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGODB_URI=mongodb://{MONGO_INITDB_ROOT_USERNAME}:{MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/confDb?authSource={MONGO_INITDB_ROOT_USERNAME}
MONGO_AUTHSOURCE={MONGO_INITDB_ROOT_USERNAME}

# google Oauth login credentials, need to go into the console to set this too
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# deploy&nextauth secrets
NEXTAUTH_SECRET=

NEXTAUTH_URL= # remember to keep "/" at the end for NEXTAUTH_URL
NEXT_PUBLIC_SITE_URL= # no "/" at the end
NEXT_PUBLIC_API_URL= # basically {NEXTAUTH_URL}/api
CLOUDFLARE_TUNNEL_TOKEN= # set service to http:nextjs:3000 on the control panel

ECPAY_MERCHANT_ID=
ECPAY_HASH_KEY=
ECPAY_HASH_IV=
ECPAY_API_URL=
ECPAY_QUERY_API_URL=


# email services
EMAIL_USER=
EMAIL_APP_PASSWORD= # remember to use "APP password" not, normal password
EMAIL_SENDER_NAME=生機農機學術研討會
ADMIN_EMAIL=
```

## 3. compose up

```bash
sudo docker compose -f docker-compose.prod.yml --env-file .env up --build -d
```

## 4. restore&populate data

### 1. if backup available:

```bash
./scripts/restore <MONGO_INITDB_ROOT_PASSWORD> <backup dir>
```

### 2. if starting from scratch:

Populate price options in the db:

```txt
db.paymentOptions.insertMany([
  // 早鳥價選項 (2025/05/30 ~ 2025/06/15)
  {
    paymentOptionId: "early_member",
    name: "早鳥學會會員價",
    price: 800,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-05-30T00:00:00+08:00"),
    goodUntil: new Date("2025-06-15T23:59:59+08:00"),
    displayOrder: 1,
    displayName: "早鳥優惠 - 學會會員",
    description: "學會會員專屬早鳥優惠價格，適用於2025年6月15日前報名者",
    createdAt: new Date()
  },
  {
    paymentOptionId: "early_non_member",
    name: "早鳥非學會會員價",
    price: 900,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-05-30T00:00:00+08:00"),
    goodUntil: new Date("2025-06-15T23:59:59+08:00"),
    displayOrder: 2,
    displayName: "早鳥優惠 - 非會員",
    description: "一般參加者早鳥優惠價格，適用於2025年6月15日前報名者",
    createdAt: new Date()
  },
  {
    paymentOptionId: "early_student",
    name: "早鳥學生價",
    price: 600,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-05-30T00:00:00+08:00"),
    goodUntil: new Date("2025-06-15T23:59:59+08:00"),
    displayOrder: 3,
    displayName: "早鳥優惠 - 學生",
    description: "學生專屬早鳥優惠價格，適用於2025年6月15日前報名的在校學生",
    createdAt: new Date()
  },

  // 一般價選項 (2025/06/15 ~ 2025/09/24)
  {
    paymentOptionId: "regular_member",
    name: "一般學會會員價",
    price: 900,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-06-15T00:00:00+08:00"),
    goodUntil: new Date("2025-09-24T23:59:59+08:00"),
    displayOrder: 4,
    displayName: "標準報名 - 學會會員",
    description: "學會會員標準報名價格，適用於2025年6月15日至9月24日期間",
    createdAt: new Date()
  },
  {
    paymentOptionId: "regular_non_member",
    name: "一般非學會會員價",
    price: 1000,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-06-15T00:00:00+08:00"),
    goodUntil: new Date("2025-09-24T23:59:59+08:00"),
    displayOrder: 5,
    displayName: "標準報名 - 非會員",
    description: "一般參加者標準報名價格，適用於2025年6月15日至9月24日期間",
    createdAt: new Date()
  },
  {
    paymentOptionId: "regular_student",
    name: "一般學生價",
    price: 700,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-06-15T00:00:00+08:00"),
    goodUntil: new Date("2025-09-24T23:59:59+08:00"),
    displayOrder: 6,
    displayName: "標準報名 - 學生",
    description: "學生標準報名價格，適用於2025年6月15日至9月24日期間的在校學生",
    createdAt: new Date()
  },

  // 現場報名價選項 (2025/09/24 ~ 2025/09/27)
  {
    paymentOptionId: "onsite_member",
    name: "現場學會會員價",
    price: 1000,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-09-24T00:00:00+08:00"),
    goodUntil: new Date("2025-09-27T23:59:59+08:00"),
    displayOrder: 7,
    displayName: "現場報名 - 學會會員",
    description: "學會會員現場報名價格，適用於2025年9月24日至27日研討會期間報名",
    createdAt: new Date()
  },
  {
    paymentOptionId: "onsite_non_member",
    name: "現場非學會會員價",
    price: 1100,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-09-24T00:00:00+08:00"),
    goodUntil: new Date("2025-09-27T23:59:59+08:00"),
    displayOrder: 8,
    displayName: "現場報名 - 非會員",
    description: "一般參加者現場報名價格，適用於2025年9月24日至27日研討會期間報名",
    createdAt: new Date()
  },
  {
    paymentOptionId: "onsite_student",
    name: "現場學生價",
    price: 800,
    tradeDescription: "2025生機農機學術研討會報名費",
    itemName: "2025生機農機學術研討會報名費",
    validFrom: new Date("2025-09-24T00:00:00+08:00"),
    goodUntil: new Date("2025-09-27T23:59:59+08:00"),
    displayOrder: 9,
    displayName: "現場報名 - 學生",
    description: "學生現場報名價格，適用於2025年9月24日至27日研討會期間報名的在校學生",
    createdAt: new Date()
  }
]);
```
