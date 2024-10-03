import { goalCompletions, goals } from "./../db/schema";
import dayjs from "dayjs";
import { db } from "../db";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

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

  //comum table expressions
  const goalCompletionsCount = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionsCount: count(goalCompletions.id).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionsCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      //COALESCE: PERMITE FAZER UM IF, CASO A VARIAVEL SERA NULA, PASSA O VALOR DEFAULT
      completionCount: sql`
        COALESCE(${goalCompletionsCount.completionsCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionsCount, eq(goalCompletionsCount.goalId, goalsCreatedUpToWeek.id));

  return { pendingGoals };
}
