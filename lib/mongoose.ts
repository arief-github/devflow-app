import "server-only";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Disimpan di globalThis agar bertahan saat HMR di mode dev
const cache: MongooseCache = (globalThis.mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error("Missing MONGODB_URL environment variable");
  }

  // Request bersamaan akan menunggu promise yang SAMA → hanya 1x connect
  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(url, {
      dbName: "devflow",
      bufferCommands: false, // gagal cepat jika query jalan tanpa koneksi
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // izinkan retry di request berikutnya
    throw error;
  }

  return cache.conn;
}
