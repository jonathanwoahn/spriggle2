'use client';
import { useEffect, useState } from "react";
import BookIngestionItem from "./book-ingestion-item";
import { getJobCount } from "@/app/actions";

export default function JobsItem({bookId}: {bookId: string}) {
  const [isThinking, setIsThinking] = useState(true);
  const [total, setTotal] = useState(0);
  const [max, setMax] = useState(0);
  
  useEffect(() => {
    const init = async () => {
      const { total, max } = await getJobCount({bookId});
      setTotal(total as number);
      setMax(max as number);
      setIsThinking(false);
    }
    init();
  }, []);

  return <BookIngestionItem label="Jobs" content={`${total} / ${max}`} total={total} max={max} thinking={isThinking} />;
}