import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Call Remove.bg API
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/remove-background', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY || '',
      },
      body: (() => {
        const form = new FormData()
        form.append('image_file', new Blob([buffer]), image.name)
        form.append('size', 'auto')
        return form
      })(),
    })

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text()
      console.error('Remove.bg API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      )
    }

    // Return the processed image
    const processedImage = await removeBgResponse.arrayBuffer()
    return new NextResponse(processedImage, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}