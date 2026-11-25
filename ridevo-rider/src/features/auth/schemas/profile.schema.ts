import { z } from "zod";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(50, `${label} cannot exceed 50 characters.`)
    .refine(
      (value) => /\p{L}/u.test(value),
      `${label} must contain at least one letter.`,
    )
    .refine(
      (value) => !/[\p{Cc}\p{Cs}]/u.test(value),
      `${label} contains invalid characters.`,
    );

export const profileSchema = z.object({
  firstName: nameSchema("First name"),

  lastName: nameSchema("Last name"),

  email: z
    .string()
    .trim()
    .max(254, "Email address is too long.")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email address.",
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
