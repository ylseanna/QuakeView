import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import { ReactNode, useEffect, useRef, useState } from "react";

import { BOTTOMBAR_HEIGHT, DRAWER_HEIGHT } from "../interface/bottom-bar/bottom-bar";
import { useAppStateStore } from "@/providers/app-state-provider";
import { usePathname } from "@/i18n/routing";

export default function SideDrawer({
  type,
  children,
}: {
  type: "filtering" | "formatting" | "layers";
  children: ReactNode;
}) {
  const theme = useTheme();
  const pathname = usePathname();

  const DRAWER_WIDTH = "360px";

  const ref = useRef(null);

  const { sidebarOpen, timelineBarVisible, bottombarVisible } =
    useAppStateStore((state) => state.appInterface.views);

  const [drawerOpenDuration, setDrawerOpenDuration] = useState(225);

  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => setDrawerOpenDuration(0), 225);
    } else {
      setDrawerOpenDuration(225);
    }
  }, [sidebarOpen]);

  return (
    <Drawer
      ref={ref}
      anchor="right"
      variant="persistent"
      open={sidebarOpen == type}
      transitionDuration={drawerOpenDuration}
      sx={{
        width: DRAWER_WIDTH,

        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          zIndex: theme.zIndex.appBar - 100,
          top: "calc(80px + 32px)",
          maxHeight: `calc(100vh - 80px - 32px - ${
            !pathname.startsWith("/plots")
              ? timelineBarVisible
                ? bottombarVisible
                  ? `${DRAWER_HEIGHT + BOTTOMBAR_HEIGHT}px`
                  : `${DRAWER_HEIGHT}px`
                : bottombarVisible
                  ? `${BOTTOMBAR_HEIGHT}px`
                  : `0`
              : `0`
          })`,
        },
      }}
    >
      {children}
    </Drawer>
  );
}
