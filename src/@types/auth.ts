import type { paths, components } from "./schema";

export type StartUsosLoginParams = NonNullable<
  paths["/auth/usos/start"]["get"]["parameters"]["query"]
>;

export type FinishUsosLoginParams = NonNullable<
  paths["/auth/usos/callback"]["get"]["parameters"]["query"]
>;

export type ExchangeLoginCodeBody =
  paths["/auth/exchange"]["post"]["requestBody"]["content"]["application/json"];
export type IssuedSession = components["schemas"]["IssuedSession"];
export type AuthError = components["schemas"]["ErrorBody"];

export type OtpRequestInputBody = NonNullable<
  paths["/auth/otp/request"]["post"]["requestBody"]["content"]["application/json"]
>;

export type OtpVerifyInputBody = NonNullable<
  paths["/auth/otp/verify"]["post"]["requestBody"]["content"]["application/json"]
>;
