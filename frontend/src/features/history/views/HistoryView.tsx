"use client";

import { KeyboardEvent, useState } from "react";
import { useHistory } from "../store/useHistory";
import Input from "@/components/ui/Input";
import TrackItem from "@/features/player/components/TrackItem";
import { Box } from "@/components/ui/layout";
import Text from "@/components/ui/Text";

export default function HistoryView() {
  const { data } = useHistory("1");
  console.log("data", data);
  return (
    <>
      <Box className="p-10 flex flex-col gap-4">
        <Text variant="h1">History</Text>
        {data?.map((track) => {
          return <TrackItem track={track} key={track.id} showCover />;
        })}
      </Box>
    </>
  );
}
