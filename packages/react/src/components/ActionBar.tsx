import { useRuleBuilderContext } from "../context";

export interface ActionBarProps {
  onAddRule: () => void;
  onAddGroup: () => void;
  canAddGroup?: boolean;
}

export function ActionBar({
  onAddRule,
  onAddGroup,
  canAddGroup = true,
}: ActionBarProps) {
  const { labels } = useRuleBuilderContext();

  return (
    <div className="atari-actionBar">
      <button
        type="button"
        className="atari-actionBar-btn atari-actionBar-btnPrimary"
        onClick={onAddRule}
      >
        {labels.addRule}
      </button>
      {canAddGroup && (
        <button
          type="button"
          className="atari-actionBar-btn atari-actionBar-btnSecondary"
          onClick={onAddGroup}
        >
          {labels.addGroup}
        </button>
      )}
    </div>
  );
}
