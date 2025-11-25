export const table = `create table public.token_usage_gg (
  user_id text not null,
  credits_used real null,
  plan text null default 'free'::text,
  reset_date timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint token_usage_pkey primary key (user_id),
  constraint token_usage_plan_check check (
    (
      plan = any (
        array['free'::text, 'pro'::text, 'enterprise'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_token_usage_user_id on public.token_usage using btree (user_id) TABLESPACE pg_default;`;
