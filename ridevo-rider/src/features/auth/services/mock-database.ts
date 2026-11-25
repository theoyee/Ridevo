import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AuthSession,
  AuthUser,
  SendOtpResponse,
} from "../types/auth.types";

const DATABASE_KEY = "ridevo.mock.auth.database.v1";

export interface MockChallenge extends SendOtpResponse {
  attempts: number;
  consumed: boolean;
}

export interface MockDatabase {
  version: 1;
  users: Record<string, AuthUser>;
  sessions: Record<string, AuthSession>;
  challenges: Record<string, MockChallenge>;
  activeChallenges: Record<string, string>;
}

function createEmptyDatabase(): MockDatabase {
  return {
    version: 1,
    users: {},
    sessions: {},
    challenges: {},
    activeChallenges: {},
  };
}

async function readDatabase(): Promise<MockDatabase> {
  const raw = await AsyncStorage.getItem(DATABASE_KEY);

  if (!raw) {
    return createEmptyDatabase();
  }

  const database = JSON.parse(raw) as MockDatabase;

  if (
    database.version !== 1 ||
    !database.users ||
    !database.sessions ||
    !database.challenges ||
    !database.activeChallenges
  ) {
    throw new Error("Invalid mock database.");
  }

  return database;
}

async function writeDatabase(database: MockDatabase): Promise<void> {
  await AsyncStorage.setItem(DATABASE_KEY, JSON.stringify(database));
}

// Serialize database operations to prevent lost updates.
let operationQueue: Promise<void> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation);

  operationQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

export const mockDatabase = {
  read<T>(operation: (database: MockDatabase) => T): Promise<T> {
    return enqueue(async () => {
      const database = await readDatabase();

      return operation(database);
    });
  },

  transaction<T>(operation: (database: MockDatabase) => T): Promise<T> {
    return enqueue(async () => {
      const database = await readDatabase();

      const result = operation(database);

      await writeDatabase(database);

      return result;
    });
  },

  reset(): Promise<void> {
    return enqueue(async () => {
      await AsyncStorage.removeItem(DATABASE_KEY);
    });
  },
};
