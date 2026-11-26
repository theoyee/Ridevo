import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  mockRideDatabaseSchema,
  type MockRideDatabase,
} from "../schemas/ride.schema";

const STORAGE_KEY = "ridevo.mock.rides.database.v1";

let transactionQueue: Promise<void> = Promise.resolve();

async function readDatabase(): Promise<MockRideDatabase> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      version: 1,
      rides: {},
      requests: {},
    };
  }

  return mockRideDatabaseSchema.parse(JSON.parse(stored));
}

async function writeDatabase(database: MockRideDatabase): Promise<void> {
  const validated = mockRideDatabaseSchema.parse(database);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}

export function runRideTransaction<T>(
  operation: (database: MockRideDatabase) => T | Promise<T>,
): Promise<T> {
  const transaction = transactionQueue.then(async () => {
    const database = await readDatabase();

    const previous = JSON.stringify(database);

    const result = await operation(database);

    if (JSON.stringify(database) !== previous) {
      await writeDatabase(database);
    }

    return result;
  });

  transactionQueue = transaction.then(
    () => undefined,
    () => undefined,
  );

  return transaction;
}
