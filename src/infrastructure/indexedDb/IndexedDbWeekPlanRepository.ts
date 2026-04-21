import type { WeekPlanRepositoryPort } from "../../application";
import type { EntityId, UserId, WeekPlan } from "../../domain";

export type WeekPlanLocalFirstRemoteState =
  | "unknown"
  | "local-cache-available"
  | "remote-save-pending"
  | "remote-confirmed"
  | "remote-save-failed";

export interface WeekPlanLocalFirstStatus {
  userId: UserId;
  planId: EntityId;
  localCacheAvailable: boolean;
  remoteState: WeekPlanLocalFirstRemoteState;
  localSavedAt?: string;
  remoteConfirmedAt?: string;
  remoteFailedAt?: string;
  remoteError?: string;
}

interface StoredWeekPlan {
  cacheKey: string;
  plan: WeekPlan;
  localFirstStatus?: WeekPlanLocalFirstStatus;
}

const DATABASE_NAME = "weeknary-weekplan";
const DATABASE_VERSION = 1;
const STORE_NAME = "week_plans";

export class IndexedDbWeekPlanRepository implements WeekPlanRepositoryPort {
  constructor(private readonly remoteRepository: WeekPlanRepositoryPort) {}

  async getById(userId: UserId, id: EntityId) {
    const cached = await this.readLocal(userId, id);

    if (cached) {
      return cached;
    }

    const remote = await this.remoteRepository.getById(userId, id);

    if (remote) {
      await this.writeLocal(remote, this.remoteConfirmedStatus(remote));
    }

    return remote;
  }

  async getActiveByUser(userId: UserId) {
    const localPlans = await this.listLocalByUser(userId);
    const localActive =
      localPlans
        .filter((plan) => plan.status === "active")
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ??
      null;

    if (localActive) {
      return localActive;
    }

    const remoteActive = await this.remoteRepository.getActiveByUser(userId);

    if (remoteActive) {
      await this.writeLocal(remoteActive, this.remoteConfirmedStatus(remoteActive));
    }

    return remoteActive;
  }

  async listByUser(userId: UserId) {
    const localPlans = await this.listLocalByUser(userId);

    if (localPlans.length > 0) {
      return localPlans;
    }

    const remotePlans = await this.remoteRepository.listByUser(userId);
    await Promise.all(
      remotePlans.map((plan) => this.writeLocal(plan, this.remoteConfirmedStatus(plan))),
    );
    return remotePlans;
  }

  async save(plan: WeekPlan) {
    await this.writeLocal(plan, {
      userId: plan.userId,
      planId: plan.id,
      localCacheAvailable: true,
      remoteState: "remote-save-pending",
      localSavedAt: new Date().toISOString(),
    });

    try {
      const remoteSaved = await this.remoteRepository.save(plan);
      await this.writeLocal(remoteSaved, this.remoteConfirmedStatus(remoteSaved));
      return remoteSaved;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      await this.writeLocal(plan, {
        userId: plan.userId,
        planId: plan.id,
        localCacheAvailable: true,
        remoteState: "remote-save-failed",
        localSavedAt: new Date().toISOString(),
        remoteFailedAt: new Date().toISOString(),
        remoteError: message,
      });
      throw new Error(
        `WeekPlan was saved locally but remote save failed: ${message}`,
      );
    }
  }

  async getLocalFirstStatus(userId: UserId, id: EntityId): Promise<WeekPlanLocalFirstStatus> {
    const stored = await this.readStored(userId, id);

    if (!stored?.plan) {
      return {
        userId,
        planId: id,
        localCacheAvailable: false,
        remoteState: "unknown",
      };
    }

    return stored.localFirstStatus
      ? clone(stored.localFirstStatus)
      : {
          userId,
          planId: id,
          localCacheAvailable: true,
          remoteState: "unknown",
        };
  }

  async retryRemoteSave(userId: UserId, id: EntityId) {
    const stored = await this.readStored(userId, id);

    if (!stored?.plan) {
      throw new Error(`WeekPlan ${id} is not cached locally and cannot be retried.`);
    }

    await this.writeLocal(stored.plan, {
      ...this.statusFromStored(stored, userId, id),
      localCacheAvailable: true,
      remoteState: "remote-save-pending",
    });

    try {
      const remoteSaved = await this.remoteRepository.save(stored.plan);
      await this.writeLocal(remoteSaved, {
        ...this.remoteConfirmedStatus(remoteSaved),
        localSavedAt: stored.localFirstStatus?.localSavedAt ?? new Date().toISOString(),
      });
      return remoteSaved;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      await this.writeLocal(stored.plan, {
        ...this.statusFromStored(stored, userId, id),
        localCacheAvailable: true,
        remoteState: "remote-save-failed",
        remoteFailedAt: new Date().toISOString(),
        remoteError: message,
      });
      throw new Error(`WeekPlan remote save retry failed: ${message}`);
    }
  }

  async archive(userId: UserId, id: EntityId) {
    const existing = await this.getById(userId, id);

    if (!existing) {
      throw new Error(`WeekPlan ${id} was not found.`);
    }

    return this.save({
      ...existing,
      status: "archived",
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    });
  }

  private async readLocal(userId: UserId, id: EntityId) {
    const stored = await this.readStored(userId, id);
    return stored?.plan ? clone(stored.plan) : null;
  }

  private async readStored(userId: UserId, id: EntityId) {
    if (!isIndexedDbAvailable()) {
      return null;
    }

    const database = await openDatabase();
    const stored = await requestToPromise<StoredWeekPlan | undefined>(
      database
        .transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .get(cacheKey(userId, id)),
    );

    database.close();
    return stored ?? null;
  }

  private async listLocalByUser(userId: UserId) {
    if (!isIndexedDbAvailable()) {
      return [];
    }

    const database = await openDatabase();
    const stored = await requestToPromise<StoredWeekPlan[]>(
      database
        .transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .getAll(),
    );

    database.close();
    return stored
      .map((entry) => entry.plan)
      .filter((plan) => plan.userId === userId && !plan.deletedAt)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(clone);
  }

  private async writeLocal(plan: WeekPlan, localFirstStatus?: WeekPlanLocalFirstStatus) {
    if (!isIndexedDbAvailable()) {
      return;
    }

    const database = await openDatabase();
    await requestToPromise(
      database
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .put({
          cacheKey: cacheKey(plan.userId, plan.id),
          plan: clone(plan),
          localFirstStatus: localFirstStatus ? clone(localFirstStatus) : undefined,
        }),
    );

    database.close();
  }

  private statusFromStored(
    stored: StoredWeekPlan,
    userId: UserId,
    id: EntityId,
  ): WeekPlanLocalFirstStatus {
    return stored.localFirstStatus
      ? clone(stored.localFirstStatus)
      : {
          userId,
          planId: id,
          localCacheAvailable: true,
          remoteState: "unknown",
        };
  }

  private remoteConfirmedStatus(plan: WeekPlan): WeekPlanLocalFirstStatus {
    const now = new Date().toISOString();

    return {
      userId: plan.userId,
      planId: plan.id,
      localCacheAvailable: true,
      remoteState: "remote-confirmed",
      localSavedAt: now,
      remoteConfirmedAt: now,
    };
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB could not open."));
  });
}

function requestToPromise<TResult>(request: IDBRequest<TResult>) {
  return new Promise<TResult>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function isIndexedDbAvailable() {
  return typeof indexedDB !== "undefined";
}

function cacheKey(userId: UserId, id: EntityId) {
  return `${userId}:${id}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
