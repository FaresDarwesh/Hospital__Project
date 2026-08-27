import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("stethoscope"),
  color: text("color").notNull().default("#0F6B5E"),
  // لا نحتفظ بكلمة المرور نفسها؛ نخزن hash فقط.
  accessPasswordHash: text("access_password_hash").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default("أخصائي"),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  bio: text("bio").notNull().default(""),
  image: text("image").notNull().default(""),
  reservationFee: text("reservation_fee").notNull().default("كشف رمزي"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schedules = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday ... 6 = Saturday
    startTime: text("start_time").notNull(), // "17:00"
    endTime: text("end_time").notNull(), // "21:00"
    slotMinutes: integer("slot_minutes").notNull().default(15),
  },
  (t) => [index("schedules_doctor_idx").on(t.doctorId)]
);

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    refCode: text("ref_code").notNull().unique(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    time: text("time").notNull(), // HH:MM
    queueNumber: integer("queue_number").notNull().default(1),
    patientName: text("patient_name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull().default(""),
    age: integer("age").notNull(),
    visitType: text("visit_type").notNull().default("new"), // new | followup
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("confirmed"), // confirmed | checked_in | completed | no_show
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("appointments_unique_slot").on(t.doctorId, t.date, t.time),
    index("appointments_doctor_date_idx").on(t.doctorId, t.date),
    index("appointments_phone_idx").on(t.phone),
    index("appointments_date_idx").on(t.date),
  ]
);
