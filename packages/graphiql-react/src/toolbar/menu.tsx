import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { DropdownMenu, Tooltip } from '../ui';

import './menu.css';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

type ToolbarMenuProps = {
  button: ReactNode;
  label: string;
};

const ToolbarMenuRoot = ({
  button,
  children,
  label,
  ...props
}: ToolbarMenuProps & {
  children: ReactNode;
  className?: string;
} & DropdownMenuProps) => {
  return (
    <DropdownMenu {...props}>
      <Tooltip label={label}>
        <DropdownMenu.Button
          className={clsx(
            'graphiql-un-styled graphiql-toolbar-menu',
            props.className,
          )}
          aria-label={label}
        >
          {button}
        </DropdownMenu.Button>
      </Tooltip>
      <DropdownMenu.Content>{children}</DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const ToolbarMenu = Object.assign(ToolbarMenuRoot, {
  Item: DropdownMenu.Item,
});
