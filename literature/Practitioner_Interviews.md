# Practitioner Interview Summaries

This document outlines the key insights gathered from expert interviews conducted with Ayurvedic practitioners to validate the technical and domain-specific foundations of the AyurVAID system.

---

## Interview 1: Clinical Diagnosis and Patient Assessment Protocols
**Objective:** To understand the traditional methodology used by practitioners to diagnose patients and determine their Prakriti (body constitution).

### Key Insights:
*   **Methodological Framework:** The practitioner detailed the use of *Trividha Pariksha* (Three-fold Examination) comprising *Darshana* (Observation), *Sparshana* (Palpation/Touch), and *Prashna* (Interrogation).
*   **Ashta Sthana Pariksha:** The interview highlighted the importance of the "Eight-fold Examination" which includes analyzing the pulse (*Nadi*), tongue (*Jihwa*), voice (*Shabda*), skin (*Sparsha*), eyes (*Druk*), general appearance (*Akriti*), urine (*Mutra*), and stool (*Purisha*).
*   **Digital Adaptation:** The practitioner emphasized that while a digital system can effectively handle *Prashna* (Questioning) and certain aspects of *Darshana* (via image analysis), it must be designed to guide users through accurate self-reporting for tactile elements.
*   **Diagnostic Flow:** Diagnosis starts with determining the patient's baseline *Prakriti* followed by identifying any current imbalances (*Vikriti*).

---

## Interview 2: Cross-Regional Data Validation (India-Sri Lanka)
**Objective:** To validate the use of Indian Ayurvedic datasets for training the Dosha Analysis Module within the Sri Lankan context.

### Key Insights:
*   **Bio-Physiological Similarity:** The practitioner confirmed that the phenotypic and genotypic characteristics of Indian and Sri Lankan populations are highly similar due to shared ancestral lineages and geographical proximity.
*   **Shared Body Types:** It was clarified that the fundamental *Dosha* manifestations (Vata, Pitta, Kapha) remain consistent across both regions. A "Vata-type" individual in India displays the same physical and psychological markers as one in Sri Lanka.
*   **Dataset Transferability:** The expert explicitly stated that it is scientifically and clinically acceptable to utilize a high-quality dataset from an Indian study to train the Dosha Analysis Module. The underlying physiological rules governing Ayurvedic body typing are universal within the South Asian demographic.
*   **Justification:** Using the established Indian dataset provides a robust foundation for the AI model, which can then be fine-tuned if regional nuances are identified in future iterations.

---

## Interview 3: Ayurvedic Literature and Knowledge Base Construction
**Objective:** To gather expert guidance on authentic literature and herbal classifications for the RAG-based Knowledge Base.

### Key Insights:
*   **Authoritative Sources:** The practitioner recommended focusing on the *Brihat Trayi* (The Great Triad: Charaka Samhita, Susruta Samhita, and Ashtanga Hridaya) as the core textual foundation for the system's logic.
*   **Herb-Drug Mapping:** Detailed knowledge was shared regarding common herbs (e.g., Ashwagandha, Turmeric, Brahmi) and their multi-faceted benefits. The practitioner helped map these to specific symptoms and *Dosha* balancing properties.
*   **Regional Variations:** The interview touched upon local Sri Lankan herb variations (*Deshiya Chikitsa*) that complement traditional Ayurvedic practices. These were noted for inclusion in the knowledge base to enhance local relevance.
*   **Knowledge Structure:** Guidance was provided on how to categorize information—specifically linking specific herbs not just to diseases, but to specific *Vikriti* patterns, ensuring the AI provides holistic recommendations.
