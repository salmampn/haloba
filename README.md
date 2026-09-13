# HALOBA — Multi-Agent Knowledge Chat

HALOBA adalah aplikasi chat berbasis **Next.js**, **Google Gemini**, dan **Supabase pgvector** untuk menjawab pertanyaan umum serta pertanyaan kebijakan internal berbasis knowledge base.

Aplikasi menggunakan dua agent:

- **Manager Agent** untuk pertanyaan umum.
- **Specialist Agent** untuk pertanyaan yang membutuhkan Employee Handbook.
- **Rule-based router** untuk memilih agent tanpa panggilan LLM tambahan.
- **RAG pipeline** untuk mengambil document chunks dari Supabase.
- **Local fallback** ketika tidak ada context dokumen yang cukup relevan.

## Live Demo

[HALOBA — Multi-Agent Knowledge Assistant](https://haloba-chat.vercel.app/)

## Features

- Single chat interface untuk user.
- Manager untuk general Q&A.
- Specialist untuk document-grounded answers.
- Rule-based routing tanpa token LLM router.
- Gemini embeddings dan Supabase pgvector semantic search.
- Context-limited RAG untuk mengurangi token input.
- Local fallback jika retrieval tidak menemukan context yang cukup.
- Token usage dan processing-time tracking per response.
- Conversation dan message history tersimpan di Supabase.
- Markdown rendering, copy answer button, dan agent metadata di UI.

## Architecture

```text
User Message
    |
    v
Rule-Based Router
    |
    +--> Manager Agent
    |      |
    |      +--> Gemini general response
    |
    +--> Specialist Agent
           |
           +--> Generate query embedding
           +--> Supabase pgvector semantic retrieval
           |
           +--> Relevant context available?
                    |
                    +--> Yes: Gemini document-grounded response
                    |
                    +--> No: Local fallback response
                              (Gemini generation skipped)
```

## Knowledge Base

The default knowledge base is stored in:

```text
src/data/employee-handbook.txt
```

The demo Employee Handbook includes policies related to:

- Annual leave.
- Transportation reimbursement.
- Working hours and hybrid work.
- Company devices and equipment.
- Benefits and compensation.
- Overtime and public holidays.
- Business travel.
- Data security.
- Employee onboarding and probation.

Example supported questions:

```text
Berapa hari cuti tahunan?
Berapa batas reimbursement transportasi?
Apa aturan password akun kerja?
Kapan laporan perjalanan dinas harus dikirim?
Berapa tunjangan komunikasi?
Berapa lama masa percobaan karyawan baru?
```

Example questions that may not have explicit support in the handbook:

```text
Apakah ada subsidi parkir kantor?
Berapa tunjangan makan karyawan?
Apakah perusahaan menyediakan mobil operasional?
```

For unsupported questions, HALOBA returns a local no-context response when retrieval does not find sufficient evidence:

```text
Saya tidak menemukan informasi terkait pertanyaan tersebut pada dokumen yang tersedia.
```

For questions that are related to an available topic but not explicitly covered, the Specialist may provide the closest relevant handbook information while indicating the limitation of the available context.

## Token Optimization

HALOBA reduces unnecessary token usage through:

- **Rule-based routing:** agent selection is handled locally, so router token usage is `0`.
- **Selective retrieval:** only handbook-related questions are routed to Specialist.
- **Similarity threshold:** low-relevance semantic chunks are filtered before generation.
- **Context limits:** retrieved chunks and context size are capped before being sent to Gemini.
- **Adaptive output limits:** factual questions use lower output-token limits than procedural questions.
- **No-generation fallback:** Gemini generation is skipped when no relevant context is available.

Example metadata for a local fallback:

```text
Model: no-generation-needed
LLM input tokens: 0
LLM output tokens: 0
Thought tokens: 0
```

> Note: Embedding usage may not appear in the displayed total if the embedding provider does not return token metadata. Retrieval may still add latency even when Gemini text generation is skipped.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI SDK | `@google/genai` |
| LLM and embeddings | Google Gemini |
| Database | Supabase PostgreSQL |
| Vector search | pgvector |
| Validation | Zod |
| Icons | Lucide React |
| Deployment | Vercel |

## Prerequisites

- Node.js 20 or newer.
- npm.
- Supabase project with PostgreSQL and pgvector enabled.
- Google Gemini API key.

## Installation

```bash
git clone [https://github.com/salmampn/haloba.git](https://github.com/salmampn/haloba.git)
cd haloba
npm install
cp .env.example .env
```

## Environment Variables

Create `.env` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_SUPABASE_URL=[https://your-project-ref.supabase.co](https://your-project-ref.supabase.co)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

MANAGER_MODEL=your_manager_model
SPECIALIST_MODEL=your_specialist_model
EMBEDDING_MODEL=your_embedding_model
```

### Security Notes

- Never commit `.env`.
- Never expose `SUPABASE_SECRET_KEY` in browser/client-side code.
- Use the Supabase secret key only in server-side code, API routes, or seed scripts.
- Rotate credentials immediately if a key is exposed.

## Supabase Setup

Run the schema located at:

```text
src/lib/supabase/schema.sql
```

The schema creates:

```text
conversations
messages
documents
document_chunks
match_document_chunks()
```

The `messages` table records agent and token metadata:

```text
answered_by
model
router_input_tokens
router_output_tokens
embedding_tokens
llm_input_tokens
llm_output_tokens
thought_tokens
total_tokens
processing_time_ms
```

## Seed Knowledge Base

The Employee Handbook source is located at:

```text
src/data/employee-handbook.txt
```

Seed the handbook and embeddings:

```bash
npm run seed:documents
```

To remove existing documents before reseeding, run this query in Supabase SQL Editor:

```sql
delete from public.documents;
```

Related document chunks are removed automatically through `on delete cascade`.

Then seed the updated handbook:

```bash
npm run seed:documents
```

Verify seeded content:

```sql
select
  d.title,
  d.source,
  count(dc.id) as total_chunks
from public.documents d
left join public.document_chunks dc
  on dc.document_id = d.id
group by d.id, d.title, d.source
order by d.title;
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run ESLint |
| `npm run seed:documents` | Seed handbook documents and embeddings |
| `npm run test:gemini` | Test Gemini API connection |
| `npm run test:router` | Test rule-based routing |
| `npm run test:retrieval` | Test document retrieval |
| `npm run test:agents` | Test Manager and Specialist agents |
| `npm run test:rpc` | Test Supabase vector-search RPC |

## Testing

Before deployment:

```bash
npm run lint
npm run build
```

Recommended manual tests:

| Query | Expected result |
|---|---|
| `Apa itu Next.js?` | Manager general response |
| `Berapa hari cuti tahunan?` | Specialist answer grounded in the handbook |
| `Berapa batas reimbursement transportasi?` | Specialist answer: Rp150.000 per hari |
| `Apa aturan password akun kerja?` | Specialist answer grounded in the handbook |
| `Kapan laporan perjalanan dinas harus dikirim?` | Specialist answer: maksimal tiga hari kerja setelah kembali |
| `Berapa lama masa percobaan karyawan baru?` | Specialist answer: tiga bulan |
| `Apakah ada subsidi parkir kantor?` | Specialist fallback if no supporting context is found |

## Token Monitoring

Inspect recent assistant responses:

```sql
select
  content,
  answered_by,
  model,
  embedding_tokens,
  llm_input_tokens,
  llm_output_tokens,
  thought_tokens,
  total_tokens,
  processing_time_ms,
  created_at
from public.messages
where role = 'assistant'
order by created_at desc
limit 20;
```

Check local fallback usage:

```sql
select
  content,
  model,
  llm_input_tokens,
  llm_output_tokens,
  thought_tokens,
  total_tokens,
  created_at
from public.messages
where role = 'assistant'
  and model = 'no-generation-needed'
order by created_at desc;
```

## Limitations

HALOBA is an educational and portfolio MVP.

- The Employee Handbook contains demo policy data.
- Routing is rule-based and needs maintenance when new domains are added.
- Semantic search can return context that is topically related but not specific enough to fully answer a question.
- A similarity threshold reduces false positives but does not eliminate every partial-relevance case.
- No authentication or per-user document access control is implemented yet.
- Documents are seeded from a local text file rather than uploaded through an admin dashboard.
- Token totals may not include embedding usage when embedding token metadata is unavailable.

## Future Improvements

- Add authentication and Supabase Row Level Security.
- Add hybrid search using PostgreSQL full-text search and pgvector.
- Add a retrieval acceptance gate and reranking for larger knowledge bases.
- Add document citations and source previews in the chat UI.
- Add document upload and ingestion via an admin dashboard.
- Add automated router and retrieval regression tests.
- Add database-backed embedding caching.
- Add conversation memory with context limits and summarization.
- Add rate limiting and abuse protection.

## License

Educational and portfolio use.
