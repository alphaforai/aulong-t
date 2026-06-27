/** 球队旗帜色条（mock 展示用） */
export const TEAM_FLAG_COLORS: Record<string, string[]> = {
  "worldCup.teams.france": ["#1642a0", "#fff", "#f0181e"],
  "worldCup.teams.portugal": ["#0b8f43", "#f0181e"],
  "worldCup.teams.brazil": ["#0b8f43", "#f0c000"],
  "worldCup.teams.argentina": ["#74acdf", "#fff", "#74acdf"],
  "worldCup.teams.germany": ["#000", "#f0181e", "#f0c000"],
  "worldCup.teams.spain": ["#f0181e", "#f0c000"],
  "worldCup.teams.england": ["#fff", "#f0181e", "#1642a0"],
  "worldCup.teams.italy": ["#0b8f43", "#fff", "#f0181e"],
  "worldCup.teams.japan": ["#fff", "#f0181e"],
  "worldCup.teams.korea": ["#fff", "#1642a0", "#f0181e"],
  "worldCup.teams.netherlands": ["#f0181e", "#fff", "#1642a0"],
  "worldCup.teams.belgium": ["#000", "#f0c000", "#f0181e"],
  "worldCup.teams.mexico": ["#0b8f43", "#fff", "#f0181e"],
  "worldCup.teams.usa": ["#1642a0", "#fff", "#f0181e"],
  "worldCup.teams.croatia": ["#f0181e", "#fff", "#1642a0"],
  "worldCup.teams.morocco": ["#f0181e", "#0b8f43"],
  "worldCup.teams.uruguay": ["#fff", "#1642a0"],
  "worldCup.teams.colombia": ["#f0c000", "#1642a0", "#f0181e"],
  "worldCup.teams.australia": ["#1642a0", "#fff", "#f0181e"],
  "worldCup.teams.saudi": ["#0b8f43", "#fff"],
};

type TeamFlagProps = {
  colors: string[];
  size?: "sm" | "md";
};

export function TeamFlag({ colors, size = "md" }: TeamFlagProps) {
  const sizeClass =
    size === "sm" ? "h-[18px] w-[28px]" : "h-7 w-[42px]";

  return (
    <div
      className={`flex shrink-0 overflow-hidden rounded border border-[#f0f1f3] ${sizeClass}`}
    >
      {colors.map((color) => (
        <span
          key={color}
          className="h-full min-w-0 flex-1"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function resolveTeamFlagColors(teamKey: string) {
  return TEAM_FLAG_COLORS[teamKey] ?? ["#f0f1f3", "#acacac"];
}

const TEAM_NAME_FLAG_COLORS: Record<string, string[]> = {
  france: TEAM_FLAG_COLORS["worldCup.teams.france"],
  portugal: TEAM_FLAG_COLORS["worldCup.teams.portugal"],
  brazil: TEAM_FLAG_COLORS["worldCup.teams.brazil"],
  argentina: TEAM_FLAG_COLORS["worldCup.teams.argentina"],
  germany: TEAM_FLAG_COLORS["worldCup.teams.germany"],
  spain: TEAM_FLAG_COLORS["worldCup.teams.spain"],
  england: TEAM_FLAG_COLORS["worldCup.teams.england"],
  italy: TEAM_FLAG_COLORS["worldCup.teams.italy"],
  japan: TEAM_FLAG_COLORS["worldCup.teams.japan"],
  korea: TEAM_FLAG_COLORS["worldCup.teams.korea"],
  netherlands: TEAM_FLAG_COLORS["worldCup.teams.netherlands"],
  belgium: TEAM_FLAG_COLORS["worldCup.teams.belgium"],
  mexico: TEAM_FLAG_COLORS["worldCup.teams.mexico"],
  usa: TEAM_FLAG_COLORS["worldCup.teams.usa"],
  croatia: TEAM_FLAG_COLORS["worldCup.teams.croatia"],
  morocco: TEAM_FLAG_COLORS["worldCup.teams.morocco"],
  uruguay: TEAM_FLAG_COLORS["worldCup.teams.uruguay"],
  colombia: TEAM_FLAG_COLORS["worldCup.teams.colombia"],
  australia: TEAM_FLAG_COLORS["worldCup.teams.australia"],
  saudi: TEAM_FLAG_COLORS["worldCup.teams.saudi"],
};

export function resolveTeamFlagByName(teamName: string) {
  const key = teamName.trim().toLowerCase();
  return TEAM_NAME_FLAG_COLORS[key] ?? ["#f0f1f3", "#acacac"];
}
