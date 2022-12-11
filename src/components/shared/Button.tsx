export default function Button({
  children,
  action,
  type,
  ...props
}: {
  children: any;
  action: "primary" | "danger";
  type?: string;

  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      class={`${action == "primary" ? "bg-maize" : "bg-black-coral"} ${
        action == "primary" ? "text-charcoal" : "text-white"
      } py-1 px-4 rounded focus:outline-none focus:shadow-outline w-full flex flex-row justify-center items-center align-center`}
    >
      {children}
    </button>
  );
}
