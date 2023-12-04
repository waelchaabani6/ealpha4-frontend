export default function ErrorElement() {
  return (
    <div
      role="presentation"
      onClick={() => window.location.reload()}
      className="h-screen w-screen grid place-items-center bg-gray-200"
    >
      <p className="text-2xl font-semibold capitalize">Click anywhere to reload</p>
    </div>
  );
}
