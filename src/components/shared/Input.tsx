export default function Input(props: {
  disabled: boolean;
  value: string;
  onChange: (e: Event) => void;
  placeholder: string;
  id: string;
  label: string;
  type: string;
}) {
  return (
    <div class="flex flex-col w-full">
      <label for={props.id}>{props.label}</label>
      <input
        class="p-2 border rounded text-gray-700 focus:outline-none focus:shadow-outline"
        {...props}
      />
    </div>
  );
}
