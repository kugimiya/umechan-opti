import { parse, Syntax } from '@textlint/markdown-to-ast';
import Link from 'next/link';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { usePostsContext } from 'src/hooks/usePostsContext';
import { Post } from 'src/services';

import { ReplyTreeItem } from '../ReplyTreeItem';

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
  const postsInThread = usePostsContext();

  return (
    <Box $gap='8px' $flexDirection='column' $justifyContent='flex-start' $alignItems='flex-start'>
      <MD
        root={parse(fixText(post?.truncated_message || ''))}
        post={post}
        postsInThread={postsInThread.posts}
      />
    </Box>
  );
}

function MD({
  post,
  postsInThread,
  root,
}: {
  post: Post;
  postsInThread: Post[];
  root: ReturnType<typeof parse>;
}) {
  const children = root.children as unknown as ReturnType<typeof parse>[];

  switch (root.type as Syntax) {
    case Syntax.BlockQuote:
      const raw = root.raw.replace('>', '');
      const num = Number(raw);

      if (isNaN(num)) {
        return (
          <Text $color='colorGreen' $variant={TextVariant.textBody1}>
            {'>'}

            {children.map((subRoot) => (
              <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
            ))}
          </Text>
        );
      }

      const replyPost = postsInThread.find((p) => String(p.id) === String(num));

      if (replyPost) {
        return (
          <ReplyTreeItem replyPost={replyPost} variant={TextVariant.textBody1} color='colorGreen' />
        );
      }

      return (
        <Link href={`#post_${num}`}>
          <Text $variant={TextVariant.textBody1} $color='colorGreen'>
            {'>>'}

            {num}
          </Text>
        </Link>
      );

    case Syntax.Paragraph:
      return (
        <Text $variant={TextVariant.textBody1}>
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Str:
      return <>{root.raw}</>;

    case Syntax.Emphasis:
      return (
        <Text $variant={TextVariant.textBody1} $fontStyle='italic'>
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Strong:
      return (
        <Text $variant={TextVariant.textBodyBold1}>
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.Delete:
      return (
        <Text
          $variant={TextVariant.textBody1}
          style={{
            textDecoration: 'line-through',
          }}
        >
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </Text>
      );

    case Syntax.List:
      return (
        <ul>
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </ul>
      );

    case Syntax.ListItem:
      return (
        <li>
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </li>
      );

    case Syntax.Code:
      // @ts-ignore
      return (
        <pre
          style={{
            whiteSpace: 'break-spaces',
            display: 'inline',
            fontFamily: 'monaco, menlo, monospace',
            margin: 0,
            // @ts-ignore
            wordWrap: 'anywhere',
            padding: '0px 4px',
            fontSize: '14px',
            lineHeight: '18px',
            borderRadius: '4px',
            background: 'black',
            color: 'white',
          }}
        >
          {/* @ts-ignore */}

          {root.value}
        </pre>
      );

    case Syntax.CodeBlock:
      const style = {
        background: 'black',
        color: 'white',
        borderRadius: '4px',
        padding: '4px 8px',
        whiteSpace: 'pre-line',
        fontSize: '14px',
        width: '100%',
        fontFamily: 'monaco, menlo, monospace',
        margin: 0,
      };

      return (
        <>
          {/* @ts-ignore */}

          <pre style={style}>
            <code key='code'>
              {/* @ts-ignore */}

              {root.lang ? (
                // @ts-ignore
                <Text as='code' key='lang' style={{ color: 'gray' }}>{`lang=${root.lang}\n`}</Text>
              ) : null}

              {/* @ts-ignore */}

              {String(root.value).replaceAll('\n\n', '\n').replace('\n', '')}
            </code>
          </pre>
        </>
      );

    case Syntax.Link:
      return (
        <A
          $variant={TextVariant.textBodyBold1}
          // @ts-ignore
          href={String(root.url).replaceAll('.../', '')}
          target='_blank'
          rel='noreferrer'
          $color='colorTextLink'
        >
          {children.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </A>
      );

    default:
      return (
        <>
          {children?.map((subRoot) => (
            <MD postsInThread={postsInThread} post={post} key={getKey(subRoot)} root={subRoot} />
          ))}
        </>
      );
  }
}
