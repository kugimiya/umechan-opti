import { Client } from "pg";
import { ResponseEvent } from "../../types/ResponseEventsList";
import { TableEvents } from "../../types/Tables";

export const db_model_events = (client: Client) => {
  const events = {
    insert: async (event: ResponseEvent) => {
      const result = await client.query<TableEvents>({
        text: "INSERT INTO events(id, event_type, timestamp, post_id, board_id) VALUES($1, $2, $3, $4, $5) RETURNING *",
        values: [event.id, event.event_type, event.timestamp, event.post_id, event.board_id],
      });

      return result.rows[0];
    },
    is_exist: async (event: ResponseEvent) => {
      const result = await client.query<{ exists: boolean }>({
        text: "SELECT EXISTS(SELECT 1 FROM events WHERE id = $1)",
        values: [event.id],
      });

      return result.rows[0].exists;
    },
  }

  return events;
}
