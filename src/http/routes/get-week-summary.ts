import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeekSummary } from "../../functions/get-week-summary";
import { db } from "../../db";
import { goalCompletions, goals } from "../../db/schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import dayjs from "dayjs";

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  app.get("/summary", async () => {
    const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
          createdAt: goals.createdAt,
        })
        .from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek))
    );

    const goalsCompletedInWeek = db.$with("goal_completion_counts").as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          completedAt: goalCompletions.createdAt,
          completedAtDate: sql`
            DATE(${goalCompletions.createdAt})
          `.as("completedAtDate"),
        })
        .from(goalCompletions)
        .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
        .where(
          and(
            gte(goalCompletions.createdAt, firstDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfWeek)
          )
        )
        .groupBy(goalCompletions.goalId)
    );

    const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
      db
        .select({
          completedAtDate: goalsCompletedInWeek.completedAtDate,
          completions: sql`
            JSON_AGG(
                JSON_BUILD_OBJECT(
                'id', ${goalCompletions}
                )
            )
        `,
        })
        .from(goalsCompletedInWeek)
        .groupBy(goalsCompletedInWeek.completedAtDate)
    );
    return "teste";
  });
};
