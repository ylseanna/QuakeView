import { FormControl, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslations } from "next-intl";
import { MouseEvent } from "react";

import { useAppStateStore } from "@/providers/app-state-provider";

export default function DayFormatSwitcher() {
  const dayFormat = useAppStateStore(
    (state) => state.appInterface.views.dayFormat,
  );

  const setDayFormat = useAppStateStore(
    (state) => state.appInterfaceActions.viewActions.setDayFormat,
  );

  const t = useTranslations();

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
        value={dayFormat}
        exclusive
        onChange={(event: MouseEvent<HTMLElement>) =>
          setDayFormat(
            (event.target as HTMLInputElement).value as
              | "DayOfMonth"
              | "DayOfYear",
          )
        }
        aria-label="mode"
      >
        <ToggleButton value="DayOfMonth" sx={sxButton}>
          {t("Common.dayOfMonth")}
        </ToggleButton>
        <ToggleButton value="DayOfYear" sx={sxButton}>
          {t("Common.dayOfYear")}
        </ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}
