import { redirect } from "next/navigation";

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return redirect(`/book/${id}`);
}