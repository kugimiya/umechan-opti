import { Client } from "pg";
import { SettingType, TableSettings } from "../../types/Tables";

export const db_model_settings = (client: Client) => {
  const settings = {
    get: async (name: string) => {
      const result = await client.query<TableSettings>({
        text: "SELECT * FROM srvsettings WHERE name = $1",
        values: [name],
      });
      const row = result.rows[0];

      switch (row.type) {
        case SettingType.Number:
          return Number(row.value);

        default:
          return row.value;
      }
    },
    set: async (name: string, value: string) => {
      const result = await client.query<TableSettings>({
        text: "UPDATE srvsettings set value=$1 WHERE name=$2 RETURNING *",
        values: [value, name],
      });

      return result.rows[0];
    }
  };

  return settings;
}
