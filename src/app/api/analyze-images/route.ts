import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    // Read uploaded images
    const imagePaths = [
      '/home/z/my-project/upload/IMG_20260420_203609.jpg',
      '/home/z/my-project/upload/IMG_20260420_203935.jpg',
      '/home/z/my-project/upload/Screenshot_2026-04-20-20-37-04-095_com.billsarthi-edit.jpg',
      '/home/z/my-project/upload/IMG_20260420_203854.jpg',
      '/home/z/my-project/upload/IMG_20260420_203818.jpg'
    ];

    const zai = await ZAI.create();

    // Convert images to base64
    const base64Images = imagePaths.map((path, index) => {
      const imageBuffer = fs.readFileSync(path);
      const base64 = imageBuffer.toString('base64');
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`
        },
        index
      };
    });

    // Build content array
    const content = [
      {
        type: 'text',
        text: question
      },
      ...base64Images
    ];

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content
        }
      ],
      thinking: { type: 'disabled' }
    });

    const analysis = response.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
