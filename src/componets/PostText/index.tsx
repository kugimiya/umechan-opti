import { Post } from "src/types/post";
import { parse, Syntax } from '@textlint/markdown-to-ast';
import { Text } from "../Text";
import Link from "next/link";
import styled from "styled-components";
import { Box } from "../Box";

const getKey = (root: ReturnType<typeof parse>) => {
  if (!root.loc) {
    return JSON.stringify(root);
  }

  return `${root.loc.start.column}_${root.loc.start.line}_${root.loc.end.column}_${root.loc.end.line}`;
}

const fixText = (text: string): string => {
  let strings = text.split('\n');
  const newed = strings.reduce((acc, cur) => {
    if (cur.startsWith('>>')) {
      const [num, ...other] = cur.replaceAll('>>', '').split(' ').map(i => i.trim());
      return [...acc, ...[ `>${num}`, other.join(' ') ]];
    }

    return [...acc, cur];
  }, [] as string[]);

  return newed.join('\n\n');
}

const A = styled(Text)`
  cursor: pointer;
  color: brown;
  font-weight: bold;
`;

export const PostText = ({ post }: { post: Post }) => {  
  return (
    <Box gap="8px" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
      <MD root={parse(fixText(post?.truncated_message || ''))} />
    </Box>
  );
}

const MD = ({ root }: { root: ReturnType<typeof parse> }) => {
  const children = (root.children as Array<ReturnType<typeof parse>>);

  switch (root.type) {
    case Syntax.BlockQuote:
      const raw = root.raw.replace('>', '');
      const num = Number(raw);

      if (isNaN(num)) {
        return <Text color="darkgreen">&gt; {children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</Text>;
      }

      return <Link href={`#post_${num}`}><A>&gt;&gt;{num}</A></Link>;

    case Syntax.Paragraph:
      return <Text>{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</Text>;

    case Syntax.Str:
      return <>{root.raw}</>;

    case Syntax.Emphasis:
      return <Text fontStyle="italic">{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</Text>;

    case Syntax.Strong:
      return <Text fontWeight="bold">{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</Text>;

    case Syntax.Delete:
      return <Text style={{ textDecoration: 'line-through' }}>{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</Text>;

    case Syntax.List:
      return <ul>{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</ul>;

    case Syntax.ListItem:
      return <li>{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</li>;

    case Syntax.Code:
      // @ts-ignore
      return <pre style={{ whiteSpace: 'break-spaces', wordWrap: 'anywhere' }}>{root.value}</pre>

    case Syntax.CodeBlock:
      return <pre style={{ border: '1px solid darkgreen', borderRadius: '4px', padding: '4px', whiteSpace: 'pre-line' }}>[{root.lang || 'lang не указан'}]{'\n'}<code>{root.value}</code></pre>

    case Syntax.Link:
      return <a href={root.url.replaceAll('.../', '')} target="_blank" rel="noreferrer"><A>{children.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</A></a>

    default: 
      return <>{children?.map((subRoot) => <MD key={getKey(subRoot)} root={subRoot} />)}</>;
  }

  return <></>;
}
