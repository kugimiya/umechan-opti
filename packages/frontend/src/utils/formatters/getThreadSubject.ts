import { EpdsPost } from "@umechan/shared";

export const getThreadSubject = (thread: EpdsPost) => {
  return thread.subject || `Тред #${thread.id}`;
}
