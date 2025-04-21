import { parse } from "@textlint/markdown-to-ast";
import {
  ASTNodeTypes, TxtBlockQuoteNode,
  TxtCodeBlockNode, TxtCodeNode,
  TxtLinkNode, TxtListItemNode, TxtListNode,
  TxtNode, TxtParagraphNode, TxtTextNode
} from "@textlint/ast-node-types";
import React, { memo } from "react";
import Link from "next/link";
import { Box } from "@/components/layout/Box/Box";
import styles from './styles.module.css';
import { tune_post_message } from "@/utils/formatters/tune_post_message";
import { PostPointer } from "@/components/common/PostPointer/PostPointer";

type Props = {
  message?: string;
}

export const PostMDContent = memo(function PostMDComponentInner(props: Props) {
  const root = parse(tune_post_message(props.message));

  return (
    <Box flexDirection='column' justifyContent='flex-start' alignItems='flex-start' gap='var(--post-content-gap)'>
      <PostContent root={root.children} path="root" />
    </Box>
  );
});

type InnerProps = {
  root: TxtNode[];
  path: string;
}

const PostContent = (props: InnerProps) => {
  return props.root.map((item, index) => {
    if (item.type === ASTNodeTypes.Paragraph) {
      return (
        <p key={`${props.path}-${index}-p`}>
          <PostContent root={(item as TxtParagraphNode).children} path={`${props.path}-${index}-p`} />
        </p>
      );
    }

    if (item.type === ASTNodeTypes.Str) {
      return (
        <span key={`${props.path}-${index}-str`}>
          {(item as TxtTextNode).value}
        </span>
      );
    }

    if (item.type === ASTNodeTypes.Link) {
      return (
        <Link key={`${props.path}-${index}-link`} href={(item as TxtLinkNode).url} target="_blank" rel="noopener noreferrer">
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-link`} />
        </Link>
      );
    }

    if (item.type === ASTNodeTypes.CodeBlock) {
      return (
        <code key={`${props.path}-${index}-code-block`}>
          <pre>
            {(item as TxtCodeBlockNode).value}
          </pre>
        </code>
      );
    }

    if (item.type === ASTNodeTypes.Code) {
      return (
        <code key={`${props.path}-${index}-code`}>{(item as TxtCodeNode).value}</code>
      );
    }

    if (item.type === ASTNodeTypes.BlockQuote) {
      const contents = (item as TxtBlockQuoteNode).raw;
      const is_double_quote = contents.startsWith('>>');

      if (!is_double_quote) {
        return (
          <span key={`${props.path}-${index}-quote`} className={styles.quote}>{contents}</span>
        );
      }

      const second_part = contents.split('>>')[1].trim();
      const post_id = Number(second_part);
      const is_post_pointer = !Number.isNaN(post_id);
      if (is_post_pointer) {
        return (
          <PostPointer key={`${props.path}-${index}-post-pointer`} postId={post_id}>
            <span key={`${props.path}-${index}-post-pointer-quote`} className={styles.quote}>{contents}</span>
          </PostPointer>
        )
      }
    }

    if (item.type === ASTNodeTypes.Emphasis) {
      return (
        <b key={`${props.path}-${index}-emphasis`}>
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-emphasis`} />
        </b>
      );
    }

    if (item.type === ASTNodeTypes.Strong) {
      return (
        <i key={`${props.path}-${index}-strong`}>
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-strong`} />
        </i>
      );
    }

    if (item.type === ASTNodeTypes.List) {
      return (
        <ul className={styles.ul} key={`${props.path}-${index}-list`}>
          <PostContent root={(item as TxtListNode).children} path={`${props.path}-${index}-list`} />
        </ul>
      );
    }

    if (item.type === ASTNodeTypes.ListItem) {
      return (
        <li className={styles.li} key={`${props.path}-${index}-listitem`}>
          <PostContent root={(item as TxtListItemNode).children} path={`${props.path}-${index}-listitem`} />
        </li>
      );
    }

    return <React.Fragment key={`${props.path}-${index}-unknown`} />;
  });
}