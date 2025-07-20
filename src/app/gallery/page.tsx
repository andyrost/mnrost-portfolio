export default async function Gallery() {
    const res = await fetch('/api/gallery', { cache: 'no-store' });
    const imgs = await res.json();
  
    return (
      <main className="grid gap-4 p-6 md:grid-cols-3">
        {imgs.map((i: any) => (
          <img
            key={i.public_id}
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/q_auto,f_auto,w_600/${i.public_id}`}
            alt={i.public_id}
            className="rounded-lg shadow-md"
          />
        ))}
      </main>
    );
  }