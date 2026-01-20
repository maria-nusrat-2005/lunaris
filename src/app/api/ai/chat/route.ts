// Next.js API Route - Proxy for Hugging Face Router (OpenAI-compatible)
// This avoids CORS issues and handles the new router format

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, messages, parameters } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Call the OpenAI-compatible endpoint on the HF Router
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages,
          max_tokens: parameters?.max_new_tokens || 500,
          temperature: parameters?.temperature || 0.7,
          top_p: parameters?.top_p || 0.9,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'API endpoint not found on router. Please try again later.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.error || `HF API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform OpenAI format to simpler format for the frontend if needed
    // OpenAI format: { choices: [ { message: { content: "..." } } ] }
    const resultText = data.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({ generated_text: resultText });
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
