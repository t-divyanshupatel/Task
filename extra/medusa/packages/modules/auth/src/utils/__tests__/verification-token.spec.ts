import {
  generateVerificationToken,
  getVerificationTokenTtlMs,
  hashVerificationToken,
} from "../verification-token"

describe("verification-token utils", () => {
  it("generates opaque tokens and stable hashes", () => {
    const token = generateVerificationToken()

    expect(token).toEqual(expect.any(String))
    expect(hashVerificationToken(token)).toMatch(/^[a-f0-9]{64}$/)
    expect(hashVerificationToken(token)).toEqual(hashVerificationToken(token))
  })

  it("converts ttl seconds to milliseconds", () => {
    expect(getVerificationTokenTtlMs(60)).toEqual(60_000)
  })

  it("defaults ttl to 900 seconds when no argument is provided", () => {
    expect(getVerificationTokenTtlMs()).toEqual(900_000)
  })

  it("rejects invalid ttl values", () => {
    expect(() => getVerificationTokenTtlMs(0)).toThrow(
      "Verification token TTL must be a positive integer"
    )
    expect(() => getVerificationTokenTtlMs(-1)).toThrow(
      "Verification token TTL must be a positive integer"
    )
    expect(() => getVerificationTokenTtlMs(1.5)).toThrow(
      "Verification token TTL must be a positive integer"
    )
  })

  it("rejects empty verification tokens when hashing", () => {
    expect(() => hashVerificationToken("")).toThrow(
      "Verification token must be a non-empty string"
    )
    expect(() => hashVerificationToken("   ")).toThrow(
      "Verification token must be a non-empty string"
    )
  })
})
