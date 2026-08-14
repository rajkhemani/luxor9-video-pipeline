import { z } from "zod";

export const SalesVideoSchema = z.object({
  heyGenVideoId: z.string().optional(),
  heyGenUrl: z.string().url(),
  customerName: z.string().min(1),
  productName: z.string().min(1),
  productImageUrl: z.string().url(),
  productFeatures: z.array(z.string()).max(4).default([]),
  originalPrice: z.number().optional(),
  discountedPrice: z.number().optional(),
  testimonial: z.object({ text: z.string(), author: z.string(), rating: z.number().min(1).max(5) }).optional(),
  ctaText: z.string().default("Get Yours Now"),
  urgencyText: z.string().optional(),
});
export type SalesVideoProps = z.infer<typeof SalesVideoSchema>;

export const DemoStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  screenshotUrl: z.string().url().optional(),
  callout: z.object({ text: z.string(), x: z.number(), y: z.number() }).optional(),
});

export const ProductDemoSchema = z.object({
  heygenIntroUrl: z.string().url(),
  heygenIntroDuration: z.number(),
  heygenOutroUrl: z.string().url(),
  heygenOutroDuration: z.number(),
  productName: z.string(),
  productTagline: z.string(),
  demoSteps: z.array(DemoStepSchema).min(1).max(10),
  primaryCta: z.object({ text: z.string(), url: z.string().url() }),
  secondaryCta: z.object({ text: z.string(), url: z.string().url() }).optional(),
});
export type ProductDemoProps = z.infer<typeof ProductDemoSchema>;

export type VideoFormat = "instagram" | "tiktok" | "youtube-short" | "linkedin" | "youtube" | "twitter";

export const SocialVideoSchema = z.object({
  format: z.enum(["instagram", "tiktok", "youtube-short", "linkedin", "youtube", "twitter"]),
  heyGenUrl: z.string().url(),
  hookText: z.string().min(1),
  bodyPoints: z.array(z.string()).min(1).max(5),
  ctaText: z.string().default("Follow for more"),
  brandColor: z.string().default("#00d4ff"),
  showCaptions: z.boolean().default(true),
});
export type SocialVideoProps = z.infer<typeof SocialVideoSchema>;
