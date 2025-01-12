import { NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'

const DEBUG_MODE = process.env.DEBUG_MODE === 'true'
const storage = getStorage();

export async function POST(request: Request): Promise<NextResponse> {

  if (DEBUG_MODE) console.log('Received upload request');

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      if (DEBUG_MODE) console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (DEBUG_MODE) console.log('File received:', file.name);

    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    if (DEBUG_MODE) console.log('File buffer created');

    // Either use default bucket
    const bucket = storage.bucket();
    // OR specify bucket name explicitly
    // const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

    const blob = bucket.file(file.name)
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.type,
      },
      resumable: false // Add this for smaller files
    })

    if (DEBUG_MODE) console.log('Blob stream created');

    return new Promise((resolve) => {
      blobStream.on('error', (error) => {
        console.error('Upload failed:', error)
        if (DEBUG_MODE) console.log('Blob stream error:', error);
        resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }))
      })

      blobStream.on('finish', async () => {
        if (DEBUG_MODE) console.log('Blob stream finished');
        try {
          // Make the file public
          await blob.makePublic()

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          if (DEBUG_MODE) console.log('File uploaded successfully:', publicUrl);
          resolve(NextResponse.json({ success: true, url: publicUrl }))
        } catch (error) {
          console.error('Error making file public:', error)
          resolve(NextResponse.json({ error: 'Failed to make file public' }, { status: 500 }))
        }
      })

      blobStream.end(fileBuffer)
      if (DEBUG_MODE) console.log('Blob stream ended');
    })
  } catch (error) {
    console.error('Upload failed:', error)
    if (DEBUG_MODE) console.log('Caught error during upload:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}