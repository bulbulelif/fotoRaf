#!/bin/bash

echo "=========================================="
echo "Marketing Kit API Test Suite"
echo "=========================================="

BASE_URL="http://localhost:3000"

echo ""
echo "[Test 1] Turkish Concise Kit"
echo "----------------------------"
curl -s -X POST "$BASE_URL/v1/marketing/kit" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ergonomik Seramik Kupa 300ml",
    "features": ["ergonomik sap","bulaşık makinesinde yıkanabilir"],
    "industry": "housewares",
    "language": "tr",
    "tone": "concise"
  }' | jq '.'

echo ""
echo "[Test 2] English Concise Kit"
echo "----------------------------"
curl -s -X POST "$BASE_URL/v1/marketing/kit" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ergonomic Ceramic Mug 300ml",
    "features": ["ergonomic handle","dishwasher safe"],
    "industry": "housewares",
    "language": "en",
    "tone": "concise"
  }' | jq '.'

echo ""
echo "[Test 3] Turkish Detailed Kit"
echo "----------------------------"
curl -s -X POST "$BASE_URL/v1/marketing/kit" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Akıllı Bluetooth Kulaklık X500",
    "features": ["aktif gürültü engelleme","40 saat pil ömrü","hızlı şarj"],
    "industry": "electronics",
    "tone": "detailed",
    "language": "tr",
    "maxTokens": 250
  }' | jq '.'

echo ""
echo "[Test 4] Minimal Request (defaults)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/v1/marketing/kit" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Leather Wallet"
  }' | jq '.'

echo ""
echo "[Test 5] Validation Error (empty title)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/v1/marketing/kit" \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }' | jq '.'

echo ""
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="

