export default function Spinner({ class: className }: { class?: string }) {
  return (
    <div>
      <svg
        class={`animate-spin h-5 w-5 text-gray-500 ${className ?? ""}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1zm3.293 2.293a1 1 0 011.414 0L12 14.414l1.293-1.293a1 1 0 011.32-.083l.094.083a1 1 0 01.083 1.32l-.083.094-2 2a1 1 0 01-1.32.083l-.094-.083-2-2a1 1 0 010-1.414z"
        />
      </svg>
    </div>
  );
}
