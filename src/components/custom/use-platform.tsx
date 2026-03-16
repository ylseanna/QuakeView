import { useEffect, useState } from "react";

async function getPlatform() {
  return await window.electronAPI.platform;
}

export function usePlatform() { // talk to the electronAPI and retrieve the platform id
  const [platform, setPlatform] = useState("linux");

  useEffect(() => {
    getPlatform().then((platform) => {
      if (platform) {
        setPlatform(platform);
      }
    });
  });

  return platform;
}
