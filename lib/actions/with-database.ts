import "server-only";
import { connectToDatabase } from "@/lib/mongoose";

type WithDatabaseOptions = {
  /**
   * Pesan error yang dilempar ke pemanggil.
   * Jika diisi, error asli tetap di-log di server, tetapi pemanggil menerima
   * `new Error(errorMessage)`. Jika kosong, error asli dilempar ulang apa adanya.
   */
  errorMessage?: string;
};

export function withDatabase<TArgs extends unknown[], TResult>(
  label: string,
  handler: (...args: TArgs) => Promise<TResult>,
  options: WithDatabaseOptions = {},
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      await connectToDatabase();
      return await handler(...args);
    } catch (error) {
      console.error(`[${label}]`, error);

      if (options.errorMessage) {
        throw new Error(options.errorMessage);
      }

      throw error;
    }
  };
}
