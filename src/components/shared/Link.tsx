export default function Link({
  href,
  children,
}: {
  href: string;
  children: any;
}) {
  return (
    <a href={href} class="text-cadet-blue hover:underline">
      {children}
    </a>
  );
}
