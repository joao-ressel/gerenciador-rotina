import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastify from "fastify";
import { createGoalRoute } from "./routes/create-goal";
import { createCompletionRoute } from "./routes/create-completion";
import { getPendingGoalRoute } from "./routes/get-pending-goals";
import { getWeekSummaryRoute } from "./routes/get-week-summary";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createGoalRoute);
app.register(createCompletionRoute);
app.register(getPendingGoalRoute);
app.register(getWeekSummaryRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server running");
  });
