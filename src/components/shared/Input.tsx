import { StateUpdater } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

export default function Input({
  id,
  label,
  updater,
  ...props
}: {
  id: string;
  label: string;
  value?: string;
  updater: StateUpdater<string>;
} & Omit<JSX.HTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div class="flex flex-col w-full">
      <label for={id}>{label}</label>
      <input
        class="p-2 border rounded text-gray-700 disabled:bg-[#EBEBE4] focus:outline-none focus:shadow-outline"
        onKeyUp={(e) => updater(e.currentTarget.value)}
        {...props}
      />
    </div>
  );
}
