import { Message } from "./supabase/supabase";

export function getTimeOfDelivery(message: Message): Date {
  const deliveryDate = new Date(message.sent_at);
  deliveryDate.setTime(
    deliveryDate.getTime() + message.delivery_time * 60 * 60 * 1000
  );

  return deliveryDate;
}

export function getCountdownString(deliveryTime: Date): string {
  const diff = deliveryTime.getTime() - new Date().getTime();

  if (diff < 0) {
    return "0h 0m 0s";
  }

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
}
