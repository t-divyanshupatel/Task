import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <p className="font-mono text-sm text-fg-muted">404</p>
      <Link href="/" className="mt-4 text-sm text-accent-2 hover:text-accent">
        Back to home
      </Link>
    </div>
  );
}
