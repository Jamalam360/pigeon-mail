import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

export default function Countup({
  target,
  ...props
}: { target: number } & Omit<JSX.HTMLAttributes<HTMLSpanElement>, "target">) {
  const [count, setCount] = useState(Math.round((target / 10) * 9));

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }

        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [target]);

  return <span {...props}>{count}</span>;
}
