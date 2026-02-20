#!/bin/bash

# Generate secure secrets for your .env file

echo "🔐 Generating secure secrets for your deployment"
echo ""

echo "JWT_SECRET (copy this to your .env):"
openssl rand -base64 32
echo ""

echo "ENCRYPTION_KEY (copy this to your .env - exactly 32 characters):"
openssl rand -base64 32 | cut -c1-32
echo ""

echo "Strong Database Password:"
openssl rand -base64 24
echo ""

echo "✅ Copy these values to your .env file on the server"
