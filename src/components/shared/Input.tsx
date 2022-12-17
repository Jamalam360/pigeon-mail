import { JSX } from "preact/jsx-runtime";

export default function Input(
  props: {
    id: string;
    label: string;
  } & JSX.HTMLAttributes<HTMLInputElement>
) {
  return (
    <div class="flex flex-col w-full">
      <label for={props.id}>{props.label}</label>
      <input
        class="p-2 border rounded text-gray-700 disabled:bg-[#EBEBE4] focus:outline-none focus:shadow-outline"
        {...props}
      />
    </div>
  );
}
