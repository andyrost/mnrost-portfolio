// /app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const { resources } = await cloudinary.search
    .expression('folder:portfolio/*')
    .sort_by('public_id', 'desc')
    .max_results(50)
    .execute();
  return NextResponse.json(resources);
}