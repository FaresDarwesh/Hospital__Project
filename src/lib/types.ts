// أنواع مشتركة بين السيرفر والعميل

export type DepartmentDTO = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  doctorCount?: number;
  caseCount?: number;
};

export type ScheduleDTO = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

export type DoctorDTO = {
  id: number;
  name: string;
  title: string;
  departmentId: number;
  departmentName?: string;
  departmentColor?: string;
  departmentIcon?: string;
  code: string;
  bio: string;
  image: string;
  reservationFee: string;
  active: boolean;
  schedules: ScheduleDTO[];
};

export type SlotDTO = { time: string; booked: boolean };

export type AppointmentDTO = {
  id: number;
  refCode: string;
  doctorId: number;
  date: string;
  time: string;
  queueNumber: number;
  patientName: string;
  phone: string;
  address: string;
  age: number;
  visitType: "new" | "followup";
  notes: string;
  status: "confirmed" | "checked_in" | "completed" | "no_show";
  createdAt?: string;
  doctorName?: string;
  doctorTitle?: string;
  departmentName?: string;
  departmentColor?: string;
};

export const STATUS_LABELS: Record<string, string> = {
  confirmed: "محجوز",
  checked_in: "بالداخل",
  completed: "تم الكشف",
  no_show: "لم يحضر",
};
