create extension if not exists vector;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.conversations(id)
    on delete cascade,

  role text not null
    check (role in ('user', 'assistant', 'error')),

  content text not null,

  answered_by text
    check (answered_by in ('manager', 'specialist')),

  model text,

  router_input_tokens integer not null default 0,
  router_output_tokens integer not null default 0,
  embedding_tokens integer not null default 0,

  llm_input_tokens integer not null default 0,
  llm_output_tokens integer not null default 0,
  thought_tokens integer not null default 0,

  total_tokens integer not null default 0,

  processing_time_ms integer,

  error_code integer,
  error_category text
    check (
      error_category is null
      or error_category in ('network', 'rate_limit', 'validation', 'internal')
    ),

  created_at timestamptz not null default now(),

  constraint messages_agent_response_check check (
    (
      role = 'assistant'
      and answered_by is not null
      and model is not null
    )
    or role in ('user', 'error')
  ),

  constraint messages_non_negative_tokens_check check (
    router_input_tokens >= 0
    and router_output_tokens >= 0
    and embedding_tokens >= 0
    and llm_input_tokens >= 0
    and llm_output_tokens >= 0
    and thought_tokens >= 0
    and total_tokens >= 0
  ),

  constraint messages_processing_time_check check (
    processing_time_ms is null
    or processing_time_ms >= 0
  )
);

create index messages_conversation_created_at_idx
on public.messages (conversation_id, created_at);

create table public.documents (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  source text,
  raw_content text not null,

  created_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),

  document_id uuid not null
    references public.documents(id)
    on delete cascade,

  chunk_index integer not null,
  content text not null,

  embedding vector(768) not null,

  created_at timestamptz not null default now(),

  unique (document_id, chunk_index)
);

create index document_chunks_document_id_idx
on public.document_chunks (document_id);

create index document_chunks_embedding_idx
on public.document_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count integer default 3
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity double precision
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks as dc
  where dc.embedding is not null
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

notify pgrst, 'reload schema';