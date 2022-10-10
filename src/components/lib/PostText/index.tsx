import { parse, Syntax } from '@textlint/markdown-to-ast';
import Link from 'next/link';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';

const getKey = (root: ReturnType<typeof parse>) => {
  if (!root.loc) {
    return JSON.stringify(root);
  }

  return `${root.loc.start.column}_${root.loc.start.line}_${root.loc.end.column}_${root.loc.end.line}`;
};

const fixText = (text: string): string => {
  const strings = text.split('\n');
  const newed = strings.reduce<string[]>((acc, cur) => {
    if (cur.startsWith('>>')) {
      const [num, ...other] = cur
        .replaceAll('>>', '')
        .split(' ')
        .map((i) => i.trim());
      return [...acc, ...[`>${num}`, other.join(' ')]];
    }

    return [...acc, cur];
  }, []);

  return newed.join('\n\n');
};

export function PostText({ post }: { post: Post }) {
  return (
    <Box gap='8px' flexDirection='column' justifyContent='flex-start' alignItems='flex-start'>
      <MD root={parse(fixText(post?.truncated_message || ''))} />
    </Box>
  );
}

function MD({ root }: { root: ReturnType<typeof parse> }) {
  const children = root.children as ReturnType<typeof parse>[];

  switch (root.type) {
    case Syntax.BlockQuote:
      const raw = root.raw.replace('>', '');
      const num = Number(raw);

      if (isNaN(num)) {
        return (
          <Text color='colorGreen' variant={TextVariant.textBody1}>
            {'>'}
            {children.map((subRoot) => (
              <MD key={getKey(subRoot)} root={subRoot} />
            ))}
          </Text>
        );
      }

      return (
        <Link href={`#post_${num}`}>
          <A variant={TextVariant.textBody1} color='colorGreen'>
            {'>>'}
            {num}
          </A>
        </Link>
      );

    case Syntax.Paragraph:
      return (
        <Text variant={TextVariant.textBody1}>
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Str:
      return <>{root.raw}</>;

    case Syntax.Emphasis:
      return (
        <Text variant={TextVariant.textBody1} fontStyle='italic'>
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Strong:
      return (
        <Text variant={TextVariant.textBodyBold1}>
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Delete:
      return (
        <Text
          variant={TextVariant.textBody1}
          style={{
            textDecoration: 'line-through',
          }}
        >
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.List:
      return (
        <ul>
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </ul>
      );

    case Syntax.ListItem:
      return (
        <li>
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </li>
      );

    case Syntax.Code:
      // @ts-ignore
      return (
        <pre
          style={{
            whiteSpace: 'break-spaces',
            // @ts-ignore
            wordWrap: 'anywhere',
            fontSize: '12px',
          }}
        >
          {root.value}
        </pre>
      );

    case Syntax.CodeBlock:
      return (
        <pre
          style={{
            border: '1px solid darkgreen',
            borderRadius: '4px',
            padding: '4px',
            whiteSpace: 'pre-line',
            fontSize: '12px',
          }}
        >
          [{root.lang || 'lang не указан'}]{'\n'}
          <code>{root.value.replaceAll('\n\n', '\n')}</code>
        </pre>
      );

    case Syntax.Link:
      return (
        <A
          variant={TextVariant.textBodyBold1}
          href={root.url.replaceAll('.../', '')}
          target='_blank'
          rel='noreferrer'
          color='colorTextLink'
        >
          {children.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </A>
      );

    default:
      return (
        <>
          {children?.map((subRoot) => (
            <MD key={getKey(subRoot)} root={subRoot} />
          ))}
        </>
      );
  }
}