import crypto from "crypto";

export const generateFeedId = () => {
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g. "A1B2C3"
  return `FD-${randomStr}`;
};
