import { FormControl, ToggleButton, ToggleButtonGroup, useColorScheme } from "@mui/material";
import { MouseEvent } from "react";

export default function ThemeSwitcher() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  const sxButton = {
    padding: "4px 8px 4px 8px",
    textTransform: "capitalize",
    lineHeight: 1,
  };

  return (
    <FormControl>
      <ToggleButtonGroup
        size="small"
        color="primary"
        value={mode}
        exclusive
        onChange={(event: MouseEvent<HTMLElement>) =>
          setMode(
            (event.target as HTMLInputElement).value as
              | "system"
              | "light"
              | "dark"
          )
        }
        aria-label="mode"
      >
        <ToggleButton value="system" sx={sxButton}>
          system
        </ToggleButton>
        <ToggleButton value="light" sx={sxButton}>
          light
        </ToggleButton>
        <ToggleButton value="dark" sx={sxButton}>
          dark
        </ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}