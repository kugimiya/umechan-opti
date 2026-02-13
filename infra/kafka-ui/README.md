# Kafka UI

Веб-интерфейс для просмотра топиков, консьюмеров и сообщений Kafka. Подключается к **внешнему** кластеру (брокеры задаются через env), без своих брокеров в compose.

## Запуск

1. Скопировать env и указать адрес Kafka:
   ```bash
   cp .env.example .env
   # В .env задать KAFKA_BOOTSTRAP_SERVERS (например host:9092 или kafka.example.com:9092)
   ```

2. Поднять контейнер:
   ```bash
   docker compose up -d
   ```

3. Открыть UI: http://localhost:8080 (или порт из `KAFKA_UI_PORT`).

## Переменные

| Переменная | Описание |
|------------|----------|
| `KAFKA_BOOTSTRAP_SERVERS` | Список брокеров (обязательно), например `kafka1:9092,kafka2:9092` |
| `KAFKA_CLUSTER_NAME` | Имя кластера в UI (по умолчанию `default`) |
| `KAFKA_UI_PORT` | Порт хоста для UI (по умолчанию `8080`) |
| `KAFKA_PROPERTIES_SECURITY_PROTOCOL` | Для SASL: `SASL_PLAINTEXT` или `SASL_SSL` |
| `KAFKA_PROPERTIES_SASL_MECHANISM` | Для SASL: `PLAIN` |
| `KAFKA_SASL_JAAS_CONFIG` | JAAS для SASL/PLAIN: `org.apache.kafka.common.security.plain.PlainLoginModule required username="..." password="...";` |

Без SASL: не задавайте переменные `KAFKA_SASL_JAAS_CONFIG`, `KAFKA_PROPERTIES_*` (или используйте отдельный compose без них).
