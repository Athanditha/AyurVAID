#!/usr/bin/env python3
"""
Hugging Face model inference script for AyurVAID
Supports various models for health recommendation generation
"""

import argparse
import json
import sys
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

def load_model(model_name):
    """Load the specified model and tokenizer"""
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None
        )
        return tokenizer, model
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        sys.exit(1)

def generate_response(model_name, prompt, max_length=500, temperature=0.7):
    """Generate response using the specified model"""
    try:
        # For health-specific models, you might want to use:
        # - "microsoft/BioGPT-Large" for biomedical text
        # - "dmis-lab/biobert-base-cased-v1.1" for medical understanding
        # - "allenai/scibert_scivocab_uncased" for scientific text
        
        if "DialoGPT" in model_name:
            # Use pipeline for DialoGPT
            chatbot = pipeline(
                "conversational",
                model=model_name,
                tokenizer=model_name
            )
            
            response = chatbot(prompt)
            return response.generated_responses[-1]
        
        else:
            # Use standard text generation
            tokenizer, model = load_model(model_name)
            
            # Add special tokens if not present
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            inputs = tokenizer.encode(prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=max_length,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id,
                    num_return_sequences=1
                )
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Remove the original prompt from response
            response = response[len(prompt):].strip()
            
            return response
            
    except Exception as e:
        print(f"Error generating response: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Generate AI responses using Hugging Face models')
    parser.add_argument('--model', required=True, help='Model name from Hugging Face')
    parser.add_argument('--prompt', required=True, help='Input prompt')
    parser.add_argument('--max_length', type=int, default=500, help='Maximum response length')
    parser.add_argument('--temperature', type=float, default=0.7, help='Generation temperature')
    
    args = parser.parse_args()
    
    # Generate response
    response = generate_response(
        args.model,
        args.prompt,
        args.max_length,
        args.temperature
    )
    
    # Return JSON response
    result = {
        "response": response,
        "model": args.model,
        "usage": {
            "prompt_tokens": len(args.prompt.split()),
            "completion_tokens": len(response.split())
        }
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()