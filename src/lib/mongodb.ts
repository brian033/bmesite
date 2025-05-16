// // src/lib/mongodb.ts
// import { MongoClient } from "mongodb";

// const uri = process.env.MONGODB_URI!;
// const client = new MongoClient(uri);
// const clientPromise = client.connect();

// export default clientPromise;
import { MongoClient } from "mongodb";

// 連接池配置
const options = {
    maxPoolSize: 10, // 限制最大連接數
    minPoolSize: 2, // 保持的最小連接數
    socketTimeoutMS: 30000, // 連接超時
    connectTimeoutMS: 30000, // 建立連接的超時時間
    retryWrites: true, // 自動重試寫操作
};

// 全局緩存
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 獲取 MongoDB URI
const uri = process.env.MONGODB_URI!;

if (!uri) {
    throw new Error("請在環境變數中添加有效的 MONGODB_URI");
}

// 創建客戶端並緩存
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // 在開發環境中使用全局變數避免熱重載創建多個連接
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // 在生產環境使用模組級別的緩存
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// 添加連接監控和錯誤處理
clientPromise.then((client) => {
    client.on("connectionPoolCreated", (event) => {
        console.log("MongoDB 連接池已創建");
    });

    client.on("connectionPoolClosed", (event) => {
        console.log("MongoDB 連接池已關閉");
    });

    client.on("connectionPoolCleared", (event) => {
        console.log("MongoDB 連接池已清空");
    });

    // 捕獲潛在的連接錯誤
    client.on("error", (error) => {
        console.error("MongoDB 連接錯誤:", error);
    });

    // 優雅關閉處理 (僅開發模式下使用，生產環境應該在進程級別處理)
    if (process.env.NODE_ENV === "development") {
        const gracefulShutdown = () => {
            client
                .close(true)
                .then(() => {
                    console.log("MongoDB 連接已安全關閉");
                    process.exit(0);
                })
                .catch((err) => {
                    console.error("關閉 MongoDB 連接出錯:", err);
                    process.exit(1);
                });
        };

        // 捕獲終止信號
        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);
    }
});

// 導出緩存的連接 Promise
export default clientPromise;

// 便捷函數用於獲取已連接的客戶端
export async function getConnectedClient() {
    return clientPromise;
}
