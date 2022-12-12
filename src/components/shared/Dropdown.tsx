export default function Dropdown(props: {
  id: string;
  label: string;
  disabled: boolean;
  values: string[];
  onChange: (e: Event) => void;
}) {
  return (
    <div class="flex flex-col w-full">
      <label for={props.id}>{props.label}</label>
      <select
        class="p-2 border rounded bg-white disabled:bg-[#EBEBE4] text-gray-700 focus:outline-none focus:shadow-outline"
        name={props.id}
        id={props.id}
        disabled={props.disabled}
        onChange={props.onChange}
      >
        {props.values.map((v) => (
          <option value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}
