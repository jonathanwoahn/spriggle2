'use client';

import { useEffect, useState } from "react";
import BookIngestionItem from "./book-ingestion-item";
import { getJobCount } from "@/app/actions";
import { formatDuration2 } from "@/lib/utils";
import { Divider, Stack } from "@mui/material";

export interface IIngestionMetrics {
  totalSections: number;
  completedSections: number;
  ingestionStatus: string;
  // Legacy fields
  totalJobs: number;
  completedJobs: number;
  metadataBlocks: number;
  coreBlocks: number;
  // Active metrics
  duration: number;
  audioCount: number;
  hasSummary: boolean;
  hasEmbedding: boolean;
  sections: number;
}

export const DEFAULT_METRICS: IIngestionMetrics = {
  totalSections: 0,
  completedSections: 0,
  ingestionStatus: 'pending',
  totalJobs: 0,
  completedJobs: 0,
  metadataBlocks: 0,
  coreBlocks: 0,
  duration: 0,
  audioCount: 0,
  hasSummary: false,
  hasEmbedding: false,
  sections: 0,
};

export default function BookIngestionJobItem({bookId}: {bookId: string}) {
  const [isThinking, setIsThinking] = useState(true);
  const [data, setData] = useState<IIngestionMetrics>(DEFAULT_METRICS);

    useEffect(() => {
      const init = async () => {
        const res = await getJobCount({bookId});

        const newData = {
          ...data,
          ...res,
        };

        setData(newData);
        setIsThinking(false);
      }
      init();
    }, []);

    const progressPercent = data.totalSections > 0
      ? Math.trunc((data.completedSections / data.totalSections) * 100)
      : 0;

    return (
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        sx={{ width: '100%', justifyContent: 'center' }}
        direction={{sm: "row", xs: "column"}}>
        <BookIngestionItem
          label="Progress"
          content={`${progressPercent}%`}
          total={data.completedSections}
          max={data.totalSections}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Audio"
          content={`${data.audioCount} / ${data.totalSections}`}
          total={data.audioCount}
          max={data.totalSections}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Summary"
          content={data.hasSummary ? 'Yes' : 'No'}
          total={data.hasSummary ? 1 : 0}
          max={1}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Embedding"
          content={data.hasEmbedding ? 'Yes' : 'No'}
          total={data.hasEmbedding ? 1 : 0}
          max={1}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Length"
          content={`${formatDuration2((data.duration / 1000), false)}`}
          total={data.duration}
          max={data.duration}
          thinking={isThinking}
        />
      </Stack>
    );

}
