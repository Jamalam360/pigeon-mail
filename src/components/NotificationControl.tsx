import { useEffect, useState } from "preact/hooks";

export default function NotificationControl() {
  const [enabled, setEnabled] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const notificationSetting = localStorage.getItem("notifications");

    if (
      Notification.permission === "granted" &&
      notificationSetting === "enabled"
    ) {
      setEnabled(true);
      setShow(true);
    } else if (
      notificationSetting === "disabled" &&
      Notification.permission !== "denied"
    ) {
      setEnabled(false);
      setShow(true);
    } else if (
      Notification.permission === "denied" &&
      notificationSetting !== "disabled"
    ) {
      setEnabled(false);
      setShow(false);
    } else {
      setEnabled(false);
      setShow(true);
    }
  }, [Notification.permission]);

  const handleClick = () => {
    const notificationSetting = localStorage.getItem("notifications");

    if (notificationSetting === "enabled") {
      localStorage.setItem("notifications", "disabled");
      setEnabled(false);
    } else {
      localStorage.setItem("notifications", "enabled");

      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((result) => {
          if (result === "granted") {
            setEnabled(true);
          } else {
            setEnabled(false);
          }
        });
      }

      setEnabled(true);
    }
  };

  return (
    <div class={`ml-4 ${show ? "" : "hidden"}`}>
      <button alt="Enable notifications">
        <img
          src={enabled ? "/icons/bell.svg" : "/icons/bell-off.svg"}
          onClick={handleClick}
        />
      </button>
    </div>
  );
}
