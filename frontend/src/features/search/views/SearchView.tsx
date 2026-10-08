"use client";

import { KeyboardEvent, useState } from "react";
import { useSearchBy } from "../store/useSearch";
import Input from "@/components/ui/Input";
import TrackItem from "@/features/player/components/TrackItem";
import { Box } from "@/components/ui/layout";

interface SearchViewProps {
  dataHook?: string;
}

export default function SearchView({ dataHook = "search-view" }: SearchViewProps) {
  const [draftTerm, setDraftTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data } = useSearchBy(submittedTerm);

  const handleInputChange = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter" && draftTerm) {
      setSubmittedTerm(draftTerm);
    }
  };

  return (
    <>
      <Box className="p-10 flex flex-col gap-4" dataHook={dataHook}>
        <Input
          dataHook={dataHook}
          value={draftTerm}
          onChange={(e) => setDraftTerm(e.target.value)}
          onKeyDown={handleInputChange}
        />
        {data?.results.map((track) => {
          return <TrackItem track={track} key={track.id} showCover />;
        })}
      </Box>
    </>
  );
}
