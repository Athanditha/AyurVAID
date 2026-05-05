# Custom RAG Architecture in AyurVAID

## Introduction
To prevent medical hallucinations and ground the generative AI in classical Ayurvedic texts, the AyurVAID system implements a bespoke Retrieval-Augmented Generation (RAG) pipeline. Unlike standard RAG implementations that rely on opaque vector embeddings and third-party vector databases, AyurVAID utilizes a transparent, heuristic-driven local search mechanism specifically optimized for Dosha disambiguation.

## 1. Localized Data Strategy
The knowledge base is entirely self-contained within the application (`/data/` directory), consisting of curated JSON repositories:
- `herbs.json`: Detailed botanical profiles including properties like Rasa (taste), Virya (potency), Vipaka (post-digestive effect), and Dosha pacification.
- `principles.json`: Core theoretical frameworks and clinical importance.
- `medicines.json`: Pre-formulated medicinal uses and dosages.

By keeping data local, the system guarantees data provenance, ensures zero latency during the retrieval phase, and allows the offline rule-based fallback (`CustomAI.js`) to access the same literature as the primary LLM (`GeminiAI.js`).

## 2. Weighted Heuristic Search Scoring
Instead of calculating cosine similarity on high-dimensional vectors, the RAG engine (`KnowledgeBase.js`) uses a deterministic scoring matrix. When a user submits a query, keywords are extracted and evaluated across all items:
- **Base Match (`+2`)**: Keyword appears anywhere in the text.
- **Name Match (`+5`)**: Keyword appears in the actual name of the herb/medicine.
- **Exact Match (`+10`)**: The query exactly matches the item name.
Items must score above a strict threshold (`> 5`) to be retrieved, aggressively filtering out weak or tangential matches (e.g., casual mentions of "digestion").

## 3. The Dosha Disambiguation Engine
The most critical innovation in this RAG pipeline is its awareness of Ayurvedic contraindications. If a user query mentions a specific Dosha (Vata, Pitta, Kapha), the search engine intercepts the calculation and analyzes the `pacify` array attached to each botanical element:

- **Massive Boost (`+10`)**: If the herb actively pacifies the mentioned Dosha, its score is highly elevated.
- **Minor Boost (`+3`)**: If the herb's description merely discusses the mentioned Dosha.
- **Active Penalty (`-5`)**: If the herb does *not* pacify the queried Dosha, it is mathematically penalized.

*Example:* If a user asks, "What treats kapha congestion?", the engine violently up-weights Kapha-pacifying herbs and buries herbs that might aggravate Kapha. This ensures that the generative LLM is structurally prevented from reading and subsequently recommending contraindicated treatments.

## 4. Upstream Context Injection
Retrieval occurs *upstream* of the generative process. 
1. The `AIServiceManager` intercepts the user's latest message.
2. It queries the `KnowledgeBase` and receives the top 3 safest, highest-scoring records.
3. The records are formatted into a dense, classical structure (e.g., `[1] HERB: Ashwagandha. Properties: Rasa: Katu, Virya: Ushna. Balances: Vata, Kapha.`).
4. This formatted string is permanently concatenated into the `system` role instructions under the header `ADDITIONAL AYURVEDIC KNOWLEDGE`.

By forcing the LLM to read this structured, pre-validated context before generating a single token, AyurVAID ensures that conversational warmth is provided by Gemini, but the actual medical logic is driven strictly by traditional literature.
