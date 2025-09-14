# Melissa Nielsen Rost Portfolio

A curated collection of artistic work and creative projects by Melissa Nielsen Rost, built with Next.js and Cloudinary.

## Site Structure

The site has been restructured with the following layout:

- **Main Page (`/`)**: The gallery is now the main landing page, displaying all portfolio images
- **Upload Widget**: A password-protected upload button in the top-right corner that allows adding new work to the portfolio
- **Gallery & Upload Routes**: These now redirect to the main page since functionality is integrated

## Features

- **Responsive Gallery**: Beautiful grid layout showcasing portfolio images
- **Password-Protected Upload**: Secure upload functionality for adding new work
- **Cloudinary Integration**: Cloud-based image storage and optimization
- **Modern UI**: Clean, elegant design with smooth animations

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Upload Password (for the widget)
NEXT_PUBLIC_UPLOAD_PASSWORD=your_secure_password

# Base URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Setting up Cloudinary

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Scroll to Upload presets
   - Create a new preset or use an existing one
   - Set it to "Unsigned" for client-side uploads

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the site

## Usage

- **Viewing**: The gallery displays automatically on the main page
- **Adding Work**: Click the "Add Work" button in the top-right corner and enter the password to upload new images
- **Upload Process**: After authentication, the Cloudinary upload widget will open, allowing you to select and upload images

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Cloudinary**: Cloud image management and optimization
- **Google Fonts**: Playfair Display and Inter fonts

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Security Notes

- The upload password is currently stored in environment variables
- For production, consider implementing a more secure authentication system
- The password is visible in client-side code, so use a simple password for basic protection
