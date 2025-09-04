/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as emergency from "../emergency.js";
import type * as healthRecords from "../healthRecords.js";
import type * as http from "../http.js";
import type * as patients from "../patients.js";
import type * as prescriptions from "../prescriptions.js";
import type * as reminders from "../reminders.js";
import type * as router from "../router.js";
import type * as symptoms from "../symptoms.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  emergency: typeof emergency;
  healthRecords: typeof healthRecords;
  http: typeof http;
  patients: typeof patients;
  prescriptions: typeof prescriptions;
  reminders: typeof reminders;
  router: typeof router;
  symptoms: typeof symptoms;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
