import { IBlockMetadata, ILicenseReport, LicenseType } from "@/lib/types";
import { v4 as uuid } from 'uuid';

export class PlaybackReporter {

  constructor(private readonly _metadataBlocks: IBlockMetadata[] = []) {
  }

  async reportPlayback(position: number): Promise<void> {
    const findBlock = (position: number): any => {
      return this._metadataBlocks.find((block) => {
        return 'start_time' in block.data && 'duration' in block.data &&
               (block.data.start_time! / 1000) <= position && position < ((block.data.start_time! + block.data.duration!) / 1000);
      });
    }

    const block = findBlock(position);
    if(!block) {
      console.error('No block found for position', position);
      return;
    }

    const report: ILicenseReport = {
      id: uuid(),
      blockId: block.block_id,
      licenseType: LicenseType.AUDIO_PLAYBACK,
      timestamp: Date.now(),
    };

    // check to see if the block report exists in the localstorage
    // if it does, then we can skip this report
    const reports = localStorage.getItem('playback-reports') || '[]';
    const reportsArray = JSON.parse(reports);
console.log('reportsArray', reportsArray);
    const existingReport = reportsArray.find((r: ILicenseReport) => r.blockId === report.blockId);
    if(existingReport) {
      console.log('Report already exists for block', report.blockId);
      return;
    }

    reportsArray.push(report);
    localStorage.setItem('playback-reports', JSON.stringify(reportsArray));
  }
  
}