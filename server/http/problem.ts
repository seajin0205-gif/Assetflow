import type { Response } from "express";

export const PROBLEM_BASE = "https://assetflow.dev/problems";

/** RFC 7807 Problem Details object. */
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
};

export class ProblemError extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.name = "ProblemError";
    this.problem = problem;
  }
}

export function problem(
  status: number,
  slug: string,
  title: string,
  detail: string,
  instance?: string,
): ProblemDetails {
  return {
    type: `${PROBLEM_BASE}/${slug}`,
    title,
    status,
    detail,
    ...(instance ? { instance } : {}),
  };
}

export function sendProblem(res: Response, details: ProblemDetails): void {
  res.status(details.status);
  res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
  res.json(details);
}
