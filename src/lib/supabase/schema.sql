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
    check (role in ('user', 'assistant')),

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

  created_at timestamptz not null default now()
);

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

  unique(document_id, chunk_index)
);

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
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;