"use server";

import { Resend } from "resend";
import { ContactFormValues } from "@/app/components/ContactForm";
import EmailTemplate from "./email-template";
import FeedbackEmailTemplate from "./feedback-email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendContactEmail(values: ContactFormValues) {
  const { name, email, subject, message } = values;
  try {
    await resend.emails.send({
      from: "Depth Oracle <depthoracle@cardanotools.xyz>",
      to: ["walnuts@gmail.com"],
      subject: subject,
      react: EmailTemplate({
        name: name,
        email: email,
        subject: subject,
        message: message,
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false };
  }
}

export interface FeedbackFormValues {
  name: string;
  email: string;
  rating: number;
  feedback: string;
}

export async function sendFeedbackEmail(values: FeedbackFormValues) {
  const { name, email, rating, feedback } = values;
  try {
    await resend.emails.send({
      from: "Depth Oracle <depthoracle@cardanotools.xyz>",
      to: ["walnuts@gmail.com"],
      subject: `Feedback from ${name} - ${rating} stars`,
      react: FeedbackEmailTemplate({
        name: name,
        email: email,
        rating: rating,
        feedback: feedback,
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return { success: false };
  }
}
