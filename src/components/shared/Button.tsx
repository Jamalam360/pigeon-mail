import Spinner from "./Spinner";

export default function Button({
  children,
  action,
  type,
  disabled,
  loading,
  onClick,
}: {
  children: any;
  action: "primary" | "danger";
  type?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      onClick={onClick}
      disabled={(disabled ?? false) || (loading ?? false)}
      type={type ?? "button"}
      class={`${action === "primary" ? "bg-maize" : "bg-black-coral"} ${
        action === "primary" ? "text-charcoal" : "text-white"
      } px-2 rounded focus:outline-none focus:shadow-outline w-full min-h-8 flex flex-row justify-center items-center align-center`}
    >
      <span class="p-2 font-bold">
        {loading ?? false ? <Spinner /> : children}
      </span>
    </button>
  );
}
