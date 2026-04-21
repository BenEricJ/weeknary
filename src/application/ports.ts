import type {
  EntityId,
  MealPlan,
  Profile,
  TrainingPlan,
  UserPreferences,
  UserId,
  WeekPlan,
} from "../domain";

export interface RepositoryPort<TRecord extends { id: EntityId; userId: UserId }> {
  getById(userId: UserId, id: EntityId): Promise<TRecord | null>;
  listByUser(userId: UserId): Promise<TRecord[]>;
  save(record: TRecord): Promise<TRecord>;
  archive(userId: UserId, id: EntityId): Promise<TRecord>;
}

export interface WeekPlanRepositoryPort extends RepositoryPort<WeekPlan> {
  getActiveByUser(userId: UserId): Promise<WeekPlan | null>;
}

export interface MealPlanRepositoryPort extends RepositoryPort<MealPlan> {
  getActiveByUser(userId: UserId): Promise<MealPlan | null>;
}

export interface TrainingPlanRepositoryPort extends RepositoryPort<TrainingPlan> {
  getActiveByUser(userId: UserId): Promise<TrainingPlan | null>;
}

export interface ProfileRepositoryPort {
  getByUserId(userId: UserId): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
}

export interface UserPreferencesRepositoryPort {
  getByUserId(userId: UserId): Promise<UserPreferences | null>;
  save(preferences: UserPreferences): Promise<UserPreferences>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export type AuthSession =
  | { status: "signedIn"; userId: UserId; email?: string }
  | { status: "signedOut" }
  | { status: "unavailable"; reason: string };

export interface AuthSessionProvider {
  getCurrentSession(): Promise<AuthSession>;
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  createAccount(credentials: AuthCredentials): Promise<AuthSession>;
  signOut(): Promise<void>;
}
