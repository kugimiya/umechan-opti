import { useForm } from "react-hook-form";

import { Box } from "../Box";

interface FormStruct {
  nickname: string;
  subject: string;
  text: string;
}

const Form = Box.withComponent("form");
let isSendState = false;

const createPost = async (data: unknown) =>
  await fetch("/api/message", {
    method: "POST",
    body: JSON.stringify(data),

    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (r) => await r.json());

export function CreatePostForm({
  mode,
  parentPostId,
  parentBoardId,
}: {
  mode: "post" | "thread";
  parentPostId?: string;
  parentBoardId?: string;
}) {
  const form = useForm<FormStruct>();
  const handler = async (data: FormStruct) => {
    if (isSendState) {
      return;
    }

    isSendState = true;

    await (mode === "post"
      ? createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
          parent_id: parentPostId,
        })
      : createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
        }));

    location.reload();
  };

  return (
    <Form
      flexDirection="column"
      gap="16px"
      onSubmit={form.handleSubmit(handler, () => {
        alert("Чот ты не то заполнил в форме, братка; наверн текст забыл");
      })}
      padding="8px"
      style={{ border: "1px solid black" }}
      width="460px"
    >
      <Box gap="16px">
        <Box minWidth="50px" width="50px">
          Ник
        </Box>
        <input {...form.register("nickname", { required: false })} />
      </Box>

      <Box gap="16px">
        <Box minWidth="50px" width="50px">
          Тема
        </Box>
        <input {...form.register("subject", { required: false })} />
      </Box>

      <Box gap="16px">
        <Box minWidth="50px" width="50px">
          Текст
        </Box>
        <textarea
          style={{
            minWidth: "calc(100% - 66px)",
            width: "100%",
            height: "128px",
          }}
          {...form.register("text", { required: true })}
        />
      </Box>

      <Box>
        <button type="submit">
          {mode === "thread" ? "Создать тред" : "Ответить"}
        </button>
      </Box>
    </Form>
  );
}
