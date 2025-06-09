# How to run

1. Populate price options in the db:

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

2. Unzip the public.zip to the zip folder

```bash
zip -er public.zip ./public
unzip -o public.zip -d ./
```
