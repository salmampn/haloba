Nama proyek:
Multi-Agent Document Chat

Tujuan:
Membuat aplikasi chat dengan satu UI, tetapi dua agent di backend:
Manager untuk pertanyaan umum dan Specialist untuk pertanyaan berbasis dokumen.

Tech stack:

- Next.js + TypeScript + Tailwind CSS
- Supabase PostgreSQL + pgvector
- Gemini API
- @google/genai

Agent:

- Manager: menjawab pertanyaan umum
- Specialist: menjawab berdasarkan dokumen

Routing:

- Keyword-based routing, tanpa LLM router pada MVP

Dokumen:

- Satu dokumen handbook/policy sederhana
- Dokumen dipecah menjadi beberapa chunk
- Embedding disimpan di Supabase

Data yang disimpan:

- Conversation ID
- Pesan user
- Jawaban assistant
- Agent yang menjawab
- Input token
- Output token
- Embedding token
- Total token

Tidak termasuk scope MVP:

- Login/authentication
- Upload PDF
- Streaming response
- Multi-user
- Dashboard analytics kompleks
- Banyak dokumen
