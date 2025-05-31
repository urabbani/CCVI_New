import { pgTable, text, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const climateIndicators = pgTable("climate_indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const vulnerabilityData = pgTable("vulnerability_data", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(),
  county: text("county"),
  indicatorId: integer("indicator_id").references(() => climateIndicators.id),
  score: real("score").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertClimateIndicatorSchema = createInsertSchema(climateIndicators).omit({
  id: true,
});

export const insertVulnerabilityDataSchema = createInsertSchema(vulnerabilityData).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertClimateIndicator = z.infer<typeof insertClimateIndicatorSchema>;
export type ClimateIndicator = typeof climateIndicators.$inferSelect;

export type InsertVulnerabilityData = z.infer<typeof insertVulnerabilityDataSchema>;
export type VulnerabilityData = typeof vulnerabilityData.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
