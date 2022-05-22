import React from 'react';

type HelpTooltipTextProps = {
  firstLine: string | React.ReactNode;
};
export default function HelpTooltipText(props: HelpTooltipTextProps): JSX.Element {
  const { firstLine } = props;

  return (
    <div>
      {firstLine}
      <br />
      Click the ? button on the top right of this section for more information.
    </div>
  );
}
