// Único ponto do app que lê import.meta.env — mockado no Jest (ver jest.config.ts).
export const env = {
  isDev: import.meta.env.DEV,
  baseUrl: import.meta.env.BASE_URL,
};
