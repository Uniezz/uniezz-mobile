import * as z from "zod";

export const faqProposalSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "faq.questionError")
    .max(200, "faq.questionError"),
  answer: z
    .string()
    .trim()
    .min(1, "faq.answerError")
    .max(2000, "faq.answerError"),
});
