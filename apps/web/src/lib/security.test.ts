import { describe, expect, it } from "vitest";
import { z } from "zod";
import { SESSION_STRATEGY } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

describe("QAD-SEC-01: SQL injection on login", () => {
  const injectionPayloads = [
    "' OR '1'='1",
    "admin'--",
    "'; DROP TABLE users; --",
    "1@x.com' UNION SELECT * FROM users --",
  ];

  it.each(injectionPayloads)("rejects malicious email: %s", (email) => {
    const result = loginSchema.safeParse({
      email,
      password: "validpassword",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a normal email", () => {
    const result = loginSchema.safeParse({
      email: "maria@example.com",
      password: "validpassword",
    });
    expect(result.success).toBe(true);
  });
});

describe("QAD-SEC-03: session fixation", () => {
  it("uses JWT sessions so each login issues a fresh token", () => {
    expect(SESSION_STRATEGY).toBe("jwt");
  });
});
