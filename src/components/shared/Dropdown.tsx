import { JSX } from "preact/jsx-runtime";

export default function Dropdown(
  props: {
    id: string;
    label: string;
    values: string[];
  } & JSX.HTMLAttributes<HTMLSelectElement>
) {
  return (
    <div class="flex flex-col w-full">
      <label for={props.id}>{props.label}</label>
      <select
        class="p-2 border rounded bg-white disabled:bg-[#EBEBE4] text-gray-700 focus:outline-none focus:shadow-outline"
        name={props.id}
        id={props.id}
        disabled={props.disabled}
        required={props.required}
        onChange={props.onChange}
      >
        {props.values.map((v) => (
          <option value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}
