# HALOBA — Multi-Agent Knowledge Chat

HALOBA adalah aplikasi chat berbasis **Next.js**, **Google Gemini**, dan **Supabase pgvector** untuk menjawab pertanyaan umum serta pertanyaan kebijakan internal berbasis knowledge base.

Aplikasi menggunakan arsitektur multi-agent ringan:

- **Manager Agent** untuk pertanyaan umum.
- **Specialist Agent** untuk pertanyaan yang memerlukan informasi dari Employee Handbook.
- **Rule-based router** untuk memilih agent tanpa memanggil LLM tambahan.
- **RAG pipeline** untuk mengambil document chunks relevan dari Supabase.
- **No-context fallback** untuk mencegah hallucination dan menghindari Gemini generation ketika dokumen tidak mendukung jawaban.

## Live Demo

Try the deployed application:

[HALOBA — Multi-Agent Knowledge Assistant](https://haloba-chat.vercel.app/)

## Features

- Rule-based routing without an LLM router call.
- Manager agent for general questions.
- Specialist agent for document-grounded answers.
- Gemini embeddings and Supabase pgvector semantic search.
- Employee Handbook knowledge base.
- Context-limited RAG for token efficiency.
- Local no-context fallback to prevent hallucination.
- Token usage and processing-time tracking.
- Persistent conversations and messages in Supabase.
- Markdown response rendering and copy button.

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
           |
           +--> Supabase pgvector similarity search
           |
           +--> Relevant document context found?
                    |
                    +--> Yes: Gemini document-grounded response
                    |
                    +--> No: Local fallback response
                              (Gemini generation skipped)
```

## Tech Stack

| Category        | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js                     |
| Language        | TypeScript                  |
| Styling         | Tailwind CSS                |
| AI SDK          | `@google/genai`             |
| LLM             | Google Gemini               |
| Embeddings      | Google Gemini Embedding API |
| Database        | Supabase PostgreSQL         |
| Vector database | pgvector                    |
| Icons           | Lucide React                |
| Validation      | Zod                         |

## Knowledge Base

The default knowledge base is stored in:

```text
src/data/employee-handbook.txt
```

The handbook includes demo policies for:

- Annual leave.
- Transportation reimbursement.
- Working hours and hybrid work.
- Company equipment.
- Benefits and compensation.
- Overtime and public holidays.
- Business travel.
- Data security and company-device usage.
- Employee onboarding and probation.

Example document-grounded questions:

```text
Berapa batas reimbursement transportasi?
Berapa hari cuti tahunan?
Kapan laporan perjalanan dinas harus dikirim?
Apa aturan password akun kerja?
Berapa tunjangan komunikasi?
Berapa lama masa percobaan karyawan baru?
```

Example questions without supporting handbook context:

```text
Apa kebijakan kendaraan dinas?
Apakah ada subsidi parkir kantor?
Berapa tunjangan makan?
```

Unsupported handbook queries return a local no-context response instead of a generated policy answer.

## Prerequisites

Install the following tools before running the project:

- Node.js 20 or newer.
- npm.
- Supabase project with PostgreSQL and pgvector enabled.
- Google Gemini API key.

## Installation

Clone the repository:

```bash
git clone [https://github.com/salmampn/multi-agent-chat.git](https://github.com/salmampn/multi-agent-chat.git)
cd multi-agent-chat
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

## Environment Variables

Create `.env` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_SUPABASE_URL=[https://your-project-ref.supabase.co](https://your-project-ref.supabase.co)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

MANAGER_MODEL=manager_model
SPECIALIST_MODEL=specialist_model
EMBEDDING_MODEL=embedding_model
```

### Security notes

- Never commit `.env`.
- Never expose `SUPABASE_SECRET_KEY` in client-side code.
- Only use the Supabase secret key from server-side code, such as API routes, server actions, or scripts.
- Rotate API keys immediately if they are exposed in a repository, screenshot, terminal output, or deployment log.

## Supabase Setup

Run the schema from:

```text
src/lib/supabase/schema.sql
```

The schema creates:

- `conversations`
- `messages`
- `documents`
- `document_chunks`
- `match_document_chunks()` RPC function
- pgvector embedding index

The `messages` table stores agent metadata and token metrics:

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

The project seeds the employee handbook from:

```text
src/data/employee-handbook.txt
```

Run the seed script:

```bash
npm run seed:documents
```

The script performs the following process:

1. Reads the employee handbook text file.
2. Creates a document row in Supabase.
3. Splits handbook content into chunks.
4. Generates a 768-dimension embedding for each chunk.
5. Stores each chunk and embedding in `document_chunks`.

### Reset and reseed documents

To remove old documents before reseeding, run this SQL in Supabase SQL Editor:

```sql
delete from public.documents;
```

Because `document_chunks.document_id` uses `on delete cascade`, related chunks are removed automatically.

Then run:

```bash
npm run seed:documents
```

Verify seeded data:

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

## Development

Start the local development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

| Command                  | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `npm run dev`            | Start Next.js development server                |
| `npm run build`          | Build the production application                |
| `npm run start`          | Run the production build locally                |
| `npm run lint`           | Run ESLint                                      |
| `npm run seed:documents` | Seed Employee Handbook documents and embeddings |
| `npm run test:gemini`    | Test Gemini API connection                      |
| `npm run test:retrieval` | Test document retrieval                         |
| `npm run test:agents`    | Test Manager and Specialist agents              |
| `npm run test:rpc`       | Test Supabase vector RPC function               |
| `npm run test:router`    | Test router logic                               |

### Recommended manual test cases

| Query                                           | Expected result                                             |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `Apa itu Next.js?`                              | Manager general response                                    |
| `Berapa hari cuti tahunan?`                     | Specialist document-grounded response                       |
| `Berapa batas reimbursement transportasi?`      | Specialist answer: Rp150.000 per hari                       |
| `Apa aturan password akun kerja?`               | Specialist document-grounded response                       |
| `Kapan laporan perjalanan dinas harus dikirim?` | Specialist answer: maksimal tiga hari kerja setelah kembali |
| `Berapa lama masa percobaan karyawan baru?`     | Specialist answer: tiga bulan                               |
| `Apa kebijakan kendaraan dinas?`                | No matching document fallback, without Gemini generation    |

## Limitations

This project is a demonstration MVP.

- The knowledge base contains demo employee-policy content.
- Routing is rule-based and may require maintenance when new document domains are added.
- In-memory caches, if added, are not guaranteed to persist in serverless environments.
- The UI token total may not include embedding usage if the embedding provider does not return usage metadata.
- The application does not include authentication or per-user document access control.
- Documents are seeded from a local text file rather than uploaded through an admin interface.

## Future Improvements

- Add authentication and Row Level Security policies.
- Support document upload and ingestion from an admin dashboard.
- Add document citations and source previews in the chat UI.
- Add automated router and retrieval regression tests.
- Add per-user conversations and document permissions.
- Add database-backed or Redis-backed embedding cache.
- Add hybrid search with PostgreSQL full-text search and vector search.
- Add observability dashboard for agent routing, retrieval quality, token cost, and latency.
- Add conversation memory with context-window limits and summaries.
- Add rate limiting and request-level abuse protection.

## License

This project is intended for educational and portfolio purposes.
