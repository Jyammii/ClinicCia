import { validationResult } from "express-validator";

// Put after a list of express-validator rules.
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => e.msg);
  res.status(422).json({ message: errors[0], errors });
};
