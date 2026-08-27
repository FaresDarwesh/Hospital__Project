-- مستشفى برج النور الخيري
-- شغّل هذا الملف مرة واحدة من Supabase SQL Editor.
-- لا توجد هنا أي بيانات مرضى أو حجوزات تجريبية.

create table if not exists departments (
  id serial primary key,
  name text not null unique,
  description text not null default '',
  icon text not null default 'stethoscope',
  color text not null default '#0F6B5E',
  access_password_hash text not null default '',
  created_at timestamp not null default now()
);

create table if not exists doctors (
  id serial primary key,
  name text not null,
  title text not null default 'أخصائي',
  department_id integer not null references departments(id) on delete cascade,
  code text not null unique,
  bio text not null default '',
  image text not null default '',
  reservation_fee text not null default 'كشف رمزي',
  active boolean not null default true,
  created_at timestamp not null default now()
);

create table if not exists schedules (
  id serial primary key,
  doctor_id integer not null references doctors(id) on delete cascade,
  day_of_week integer not null,
  start_time text not null,
  end_time text not null,
  slot_minutes integer not null default 15
);

create table if not exists appointments (
  id serial primary key,
  ref_code text not null unique,
  doctor_id integer not null references doctors(id) on delete cascade,
  date text not null,
  time text not null,
  queue_number integer not null default 1,
  patient_name text not null,
  phone text not null,
  address text not null default '',
  age integer not null,
  visit_type text not null default 'new',
  notes text not null default '',
  status text not null default 'confirmed',
  created_at timestamp not null default now(),
  constraint appointments_unique_slot unique (doctor_id, date, time)
);

create index if not exists schedules_doctor_idx on schedules(doctor_id);
create index if not exists appointments_doctor_date_idx on appointments(doctor_id, date);
create index if not exists appointments_phone_idx on appointments(phone);
create index if not exists appointments_date_idx on appointments(date);

-- في حالة كانت الجداول موجودة من محاولة سابقة:
alter table departments add column if not exists access_password_hash text not null default '';
