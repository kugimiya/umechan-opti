import { parse } from "@textlint/markdown-to-ast";
import {
  ASTNodeTypes,
  TxtBlockQuoteNode,
  TxtCodeBlockNode,
  TxtCodeNode,
  TxtLinkNode,
  TxtListItemNode,
  TxtListNode,
  TxtNode,
  TxtParagraphNode,
  TxtTextNode,
} from "@textlint/ast-node-types";
import React, { memo } from "react";
import Link from "next/link";
import { Box } from "@/components/layout/Box/Box";
import styles from "./styles.module.css";
import { tunePostMessage } from "@/utils/formatters/tunePostMessage";
import { PostPointer } from "@/components/common/PostPointer/PostPointer";
import { UnmodFlag } from "@umechan/shared";

type Props = {
  message?: string;
  isUnmod: UnmodFlag;
};

export const PostMDContent = memo(function PostMDComponentInner(props: Props) {
  const root = parse(tunePostMessage(props.message));

  return (
    <Box flexDirection='column' justifyContent='flex-start' alignItems='flex-start' gap='var(--post-content-gap)'>
      <PostContent root={root.children} path="root" isUnmod={props.isUnmod} />
    </Box>
  );
});

type InnerProps = {
  root: TxtNode[];
  path: string;
  isUnmod: UnmodFlag;
};

const PostContent = (props: InnerProps) => {
  return props.root.map((item, index) => {
    if (item.type === ASTNodeTypes.Paragraph) {
      return (
        <p key={`${props.path}-${index}-p`}>
          <PostContent root={(item as TxtParagraphNode).children} path={`${props.path}-${index}-p`} isUnmod={props.isUnmod} />
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
      const rawUrl = (item as TxtLinkNode).url;
      const href = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : '#';
      return (
        <Link key={`${props.path}-${index}-link`} href={href} target="_blank" rel="noopener noreferrer">
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-link`} isUnmod={props.isUnmod} />
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
      const isDoubleQuote = contents.startsWith('>>');

      if (!isDoubleQuote) {
        return (
          <span key={`${props.path}-${index}-quote`} className={styles.quote}>{contents}</span>
        );
      }

      const secondPart = contents.split('>>')[1].trim();
      const postId = Number(secondPart);
      const isPostPointer = !Number.isNaN(postId);
      if (isPostPointer) {
        return (
          <PostPointer key={`${props.path}-${index}-post-pointer`} postId={postId} isUnmod={props.isUnmod}>
            <span key={`${props.path}-${index}-post-pointer-quote`} className={styles.quote}>{contents}</span>
          </PostPointer>
        )
      }
    }

    if (item.type === ASTNodeTypes.Emphasis) {
      return (
        <b key={`${props.path}-${index}-emphasis`}>
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-emphasis`} isUnmod={props.isUnmod} />
        </b>
      );
    }

    if (item.type === ASTNodeTypes.Strong) {
      return (
        <i key={`${props.path}-${index}-strong`}>
          <PostContent root={(item as TxtLinkNode).children} path={`${props.path}-${index}-strong`} isUnmod={props.isUnmod} />
        </i>
      );
    }

    if (item.type === ASTNodeTypes.List) {
      return (
        <ul className={styles.ul} key={`${props.path}-${index}-list`}>
          <PostContent root={(item as TxtListNode).children} path={`${props.path}-${index}-list`} isUnmod={props.isUnmod} />
        </ul>
      );
    }

    if (item.type === ASTNodeTypes.ListItem) {
      return (
        <li className={styles.li} key={`${props.path}-${index}-listitem`}>
          <PostContent root={(item as TxtListItemNode).children} path={`${props.path}-${index}-listitem`} isUnmod={props.isUnmod} />
        </li>
      );
    }

    return <React.Fragment key={`${props.path}-${index}-unknown`} />;
  });
}
