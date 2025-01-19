'use client';

import { useEffect, useRef, useState } from "react";
import BookIngestionItem from "./book-ingestion-item";
import { getJobCount } from "@/app/actions";
import { formatDuration2 } from "@/lib/utils";
import { Divider, Stack } from "@mui/material";

export interface IIngestionMetrics {
  totalJobs: number;
  completedJobs: number;
  metadataBlocks: number;
  duration: number;
  audioCount: number;
  hasSummary: boolean;
  hasEmbedding: boolean;
  coreBlocks: number;
  sections: number;
}

export const DEFAULT_METRICS: IIngestionMetrics = {
  totalJobs: 0,
  completedJobs: 0,
  metadataBlocks: 0,
  duration: 0,
  audioCount: 0,
  hasSummary: false,
  hasEmbedding: false,
  coreBlocks: 0,
  sections: 0,
};

export default function BookIngestionJobItem({bookId}: {bookId: string}) {
  const [isThinking, setIsThinking] = useState(true);
  const [data, setData] = useState<IIngestionMetrics>(DEFAULT_METRICS);

    useEffect(() => {
      const init = async () => {
        const res = await getJobCount({bookId});
        console.log(res);

        const newData = {
          ...data,
          ...res,
        };

        setData(newData);
        setIsThinking(false);
      }
      init();
    }, []);

    return (
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        spacing={1}
        sx={{ width: '100%', justifyContent: 'center' }}
        direction={{sm: "row", xs: "column"}}>
        <BookIngestionItem
          label="Jobs"
          content={`${Math.trunc((data.completedJobs / data.totalJobs)* 100) || 0}%`}
          total={data.completedJobs}
          max={data.totalJobs}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Metadata"
          content={`${Math.trunc((data.metadataBlocks / data.coreBlocks) * 100)}%`}
          total={data.metadataBlocks}
          max={data.coreBlocks}
          thinking={isThinking}
        />
        <BookIngestionItem
          label="Audio"
          content={`${data.audioCount} / ${data.sections}`}
          total={data.audioCount}
          max={data.sections}
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