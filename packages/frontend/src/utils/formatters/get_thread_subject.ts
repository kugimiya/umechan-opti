import { EpdsPost } from "@/types/epds";

export const get_thread_subject = (thread: EpdsPost) => {
  return thread.subject || `Тред #${thread.id}`;
}
