import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-sm">
      <Spinner size={32} />
    </div>
  );
}
